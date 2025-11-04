-- Squad Performance Optimization Migration
-- This migration creates a view and indexes to dramatically improve squad loading performance

-- Create a materialized view for squad stats (optional, can be a regular view for simplicity)
CREATE OR REPLACE VIEW squad_stats AS
SELECT 
    s.*,
    COALESCE(member_stats.member_count, 0) as member_count,
    COALESCE(member_stats.avg_streak, 0) as avg_member_streak
FROM squads s
LEFT JOIN (
    SELECT 
        sm.squad_id,
        COUNT(sm.id) as member_count,
        AVG(COALESCE(p.current_streak, 0)) as avg_streak
    FROM squad_members sm
    LEFT JOIN progress p ON p.user_id = sm.user_id
    GROUP BY sm.squad_id
) member_stats ON s.id = member_stats.squad_id;

-- Grant access to the view
ALTER VIEW squad_stats OWNER TO postgres;
GRANT ALL ON squad_stats TO anon;
GRANT ALL ON squad_stats TO authenticated;
GRANT ALL ON squad_stats TO service_role;

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_squad_members_squad_user ON squad_members(squad_id, user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_streak ON progress(user_id, current_streak);

-- Create a function to get squad details with members efficiently
CREATE OR REPLACE FUNCTION get_squad_with_members(squad_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'squad', row_to_json(s.*),
        'members', COALESCE(members_data.members, '[]'::json)
    ) INTO result
    FROM squads s
    LEFT JOIN (
        SELECT 
            sm.squad_id,
            json_agg(
                json_build_object(
                    'id', sm.id,
                    'user_id', sm.user_id,
                    'role', sm.role,
                    'joined_at', sm.joined_at,
                    'profiles', json_build_object(
                        'nickname', p.nickname,
                        'avatar_url', p.avatar_url
                    ),
                    'progress', json_build_object(
                        'current_streak', COALESCE(pr.current_streak, 0)
                    )
                ) ORDER BY sm.joined_at
            ) as members
        FROM squad_members sm
        LEFT JOIN profiles p ON p.user_id = sm.user_id
        LEFT JOIN progress pr ON pr.user_id = sm.user_id
        WHERE sm.squad_id = squad_uuid
        GROUP BY sm.squad_id
    ) members_data ON s.id = members_data.squad_id
    WHERE s.id = squad_uuid;
    
    RETURN result;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_squad_with_members(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_squad_with_members(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_squad_with_members(UUID) TO service_role;

-- Comment describing the optimization
COMMENT ON VIEW squad_stats IS 'Optimized view for squad listing with member counts and stats';
COMMENT ON FUNCTION get_squad_with_members(UUID) IS 'Efficiently fetches squad details with all members and their profiles/progress in one call';
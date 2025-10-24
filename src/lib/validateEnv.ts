/**
 * Environment variable validation
 * Validates required environment variables on application startup
 */

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
}

const ENV_VARIABLES: EnvConfig[] = [
  {
    name: "VITE_SUPABASE_URL",
    required: true,
    description: "Supabase project URL",
  },
  {
    name: "VITE_SUPABASE_PUBLISHABLE_KEY",
    required: true,
    description: "Supabase publishable (anon) key",
  },
  {
    name: "VITE_SENTRY_DSN",
    required: false,
    description: "Sentry DSN for error tracking (optional)",
  },
];

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate all required environment variables
 * @returns ValidationResult with validation status and missing variables
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARIABLES) {
    const value = import.meta.env[envVar.name];

    if (!value || value.trim() === "") {
      if (envVar.required) {
        missing.push(envVar.name);
      } else {
        warnings.push(envVar.name);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validate environment variables and fail fast if required ones are missing
 * Call this function on application startup
 */
export function validateEnvOrFail(): void {
  const result = validateEnv();

  // Log warnings for optional variables
  if (result.warnings.length > 0) {
    console.warn(
      "⚠️ Optional environment variables not configured:",
      result.warnings.join(", ")
    );
    console.warn("Some features may not work as expected.");
  }

  // Fail fast if required variables are missing
  if (!result.valid) {
    const errorMessage = `
❌ Missing required environment variables:

${result.missing.map((name) => {
  const config = ENV_VARIABLES.find((v) => v.name === name);
  return `  - ${name}: ${config?.description || ""}`;
}).join("\n")}

Please ensure all required environment variables are set in your .env file.

Required variables:
${ENV_VARIABLES.filter((v) => v.required)
  .map((v) => `  - ${v.name}: ${v.description}`)
  .join("\n")}

Optional variables:
${ENV_VARIABLES.filter((v) => !v.required)
  .map((v) => `  - ${v.name}: ${v.description}`)
  .join("\n")}

Example .env file:
${ENV_VARIABLES.map((v) => `${v.name}=${v.required ? "your_value_here" : "(optional)"}`)
  .join("\n")}
    `.trim();

    console.error(errorMessage);

    // Display user-friendly error in the DOM
    displayEnvError(result.missing);

    throw new Error("Environment validation failed");
  }

  console.log("✅ Environment variables validated successfully");
}

/**
 * Display a user-friendly error message in the DOM
 */
function displayEnvError(missing: string[]): void {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
    ">
      <div style="
        background: white;
        border-radius: 12px;
        padding: 40px;
        max-width: 600px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      ">
        <h1 style="
          color: #e53e3e;
          font-size: 24px;
          margin-bottom: 16px;
          font-weight: 600;
        ">
          ⚠️ Configuration Error
        </h1>
        <p style="
          color: #4a5568;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        ">
          The application is missing required environment variables and cannot start.
        </p>
        <div style="
          background: #fff5f5;
          border-left: 4px solid #e53e3e;
          padding: 16px;
          margin-bottom: 20px;
          border-radius: 4px;
        ">
          <p style="
            color: #742a2a;
            font-weight: 600;
            margin-bottom: 8px;
          ">
            Missing variables:
          </p>
          <ul style="
            color: #742a2a;
            margin: 0;
            padding-left: 20px;
          ">
            ${missing.map((name) => `<li style="margin: 4px 0;">${name}</li>`).join("")}
          </ul>
        </div>
        <p style="
          color: #4a5568;
          font-size: 14px;
          line-height: 1.6;
        ">
          <strong>For developers:</strong> Please create a <code style="
            background: #edf2f7;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
          ">.env</code> file in the project root with the required variables. 
          Check the console for more details.
        </p>
      </div>
    </div>
  `;
}

/**
 * Get a validated environment variable
 * Throws an error if the variable is not set
 */
export function getEnvVar(name: string): string {
  const value = import.meta.env[name];
  
  if (!value || value.trim() === "") {
    throw new Error(`Environment variable ${name} is not set`);
  }
  
  return value;
}

/**
 * Get an optional environment variable
 * Returns undefined if not set
 */
export function getOptionalEnvVar(name: string): string | undefined {
  const value = import.meta.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

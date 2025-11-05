# PWA Troubleshooting Guide - Respira Livre

## Common Issues & Solutions

### Installation Problems

#### ❌ "Install prompt not showing"

**Symptoms:**
- No install prompt appears after 5+ seconds
- Install button is disabled
- `isInstallable = false` in test suite

**Causes & Solutions:**

**1. Platform not supported**
```
Check: PWA Test Suite → Platform Detection
iOS: Requires Safari 16.4+ (Chrome not supported)
Android: Requires Chrome 88+ or Samsung Internet 13+
Desktop: Requires Chrome/Edge 88+
```

**2. PWA already installed**
```
Check: Display mode in test suite
If "Standalone", PWA is already installed
Solution: Uninstall and reinstall to test
```

**3. Manifest issues**
```
DevTools → Application → Manifest
Check for errors in manifest.json
Ensure all required fields are present
Verify icons are accessible
```

**4. Service Worker not registered**
```
DevTools → Application → Service Workers
Should show "sw.js" as registered
If not: Check browser console for errors
```

**5. HTTPS requirement**
```
PWA requires HTTPS (except localhost)
Check URL starts with https://
Use ngrok for local HTTPS testing
```

---

#### ❌ "Install fails/cancels immediately"

**Symptoms:**
- Install prompt appears but fails
- Error in console during installation
- `trackPWAInstallFailed` event fired

**Solutions:**

**1. Clear browser cache**
```
Chrome: Settings → Privacy → Clear browsing data
Select "Cached images and files"
Try installation again
```

**2. Reset PWA state**
```javascript
// In browser console
localStorage.clear();
location.reload();
```

**3. Check beforeinstallprompt criteria**
```
DevTools → Console during page load
Should see: "[PWA] beforeinstallprompt fired"
If not: Manifest or SW issues
```

---

### iOS Specific Issues

#### ❌ "Add to Home Screen not working on iOS"

**Symptoms:**
- Share menu doesn't show "Add to Home Screen"
- Option is grayed out
- Already have app installed

**Solutions:**

**1. Use Safari only**
```
iOS PWA only works in Safari
Chrome/Firefox will not show the option
Redirect users to Safari if needed
```

**2. Check iOS version**
```
Settings → General → About → iOS Version
Requires iOS 16.4+ for full PWA support
iOS 16.0-16.3: Limited support
iOS < 16.0: No PWA support
```

**3. Clear Safari cache**
```
Settings → Safari → Clear History and Website Data
Or: Settings → Safari → Advanced → Website Data
```

**4. Check if already installed**
```
Look for app icon on home screen
If exists: Delete it first, then reinstall
```

---

#### ❌ "Notifications not working on iOS PWA"

**Symptoms:**
- Permission granted but no notifications received
- Notifications work in Safari tab but not PWA
- Test notification fails in PWA

**Solutions:**

**1. Must open from home screen**
```
Notifications only work when opened from PWA icon
Not when opened from Safari tab
Users must use installed app icon
```

**2. Check notification permission**
```
Settings → Notifications → Safari
Or: Settings → Notifications → [App Name]
Ensure "Allow Notifications" is enabled
```

**3. Re-register after install**
```javascript
// After PWA installation
await navigator.serviceWorker.ready;
// Re-request notification permission
await Notification.requestPermission();
```

---

### Android Issues

#### ❌ "beforeinstallprompt not firing"

**Symptoms:**
- Install prompt never appears on Android
- Console shows no beforeinstallprompt event
- Install button remains disabled

**Solutions:**

**1. Check PWA criteria**
```
DevTools → Application → Manifest
✓ Valid manifest.json
✓ Service worker registered
✓ HTTPS served
✓ Icons 192px and 512px present
```

**2. User engagement requirement**
```
User must interact with page first
Click, tap, or scroll before prompt can show
Add slight delay (5 seconds) after interaction
```

**3. Clear Chrome flags**
```
chrome://flags/#bypass-app-banner-engagement-checks
Set to "Enabled" for testing
Reset for production testing
```

---

#### ❌ "App installs but doesn't appear"

**Symptoms:**
- Installation seems successful
- No app icon on home screen
- Can't find installed app

**Solutions:**

**1. Check app drawer**
```
Android may place PWA in app drawer instead of home screen
Swipe up from home screen to access app drawer
Look for "Respira Livre" icon
```

**2. Restart launcher**
```
Settings → Apps → [Launcher] → Force Stop
Or restart device
PWA icon should appear after restart
```

---

### Desktop Issues  

#### ❌ "PWA not installing on Windows/Mac"

**Symptoms:**
- Install button appears but nothing happens
- No desktop shortcut created
- App not in taskbar/dock

**Solutions:**

**1. Check browser support**
```
Windows: Chrome 88+, Edge 88+
Mac: Chrome 88+, Safari 14+
Firefox: Limited support, manual install
```

**2. Enable PWA features**
```
Chrome: chrome://flags/#enable-desktop-pwas
Edge: edge://flags/#enable-desktop-pwas
Set to "Enabled" and restart browser
```

**3. Manual installation**
```
Chrome: Menu → Install [App Name]
Edge: Menu → Apps → Install this site as an app
Safari: File → Add to Dock
```

---

### Notification Issues

#### ❌ "Permission granted but no notifications"

**Symptoms:**
- `Notification.permission === 'granted'`
- Test notification doesn't appear
- No errors in console

**Solutions:**

**1. Check system notifications**
```
Windows: Settings → System → Notifications
Mac: System Preferences → Notifications
Ensure notifications enabled for browser
```

**2. Verify service worker**
```
DevTools → Application → Service Workers
Should show active service worker
Check for push subscription registration
```

**3. Test with simple notification**
```javascript
// In browser console
new Notification('Test', { body: 'Testing notifications' });
```

---

#### ❌ "Notifications blocked by browser"

**Symptoms:**
- Permission request doesn't appear
- `Notification.permission === 'denied'`
- Site shows as blocked in settings

**Solutions:**

**1. Reset site permissions**
```
Chrome: Address bar → Lock icon → Notifications → Allow
Firefox: Address bar → Shield icon → Permissions
Safari: Safari → Preferences → Websites → Notifications
```

**2. Clear site data**
```
DevTools → Application → Storage → Clear site data
Or: Browser settings → Site settings → Clear data
```

---

### Performance Issues

#### ❌ "PWA components causing slowdowns"

**Symptoms:**
- Page load time increased
- Install prompt appears too early
- High CPU usage during detection

**Solutions:**

**1. Optimize detection timing**
```javascript
// Delay detection until page is loaded
useEffect(() => {
  setTimeout(() => {
    // Run PWA detection
  }, 2000);
}, []);
```

**2. Lazy load components**
```javascript
// Only load when needed
const InstallPrompt = lazy(() => import('./InstallPrompt'));
```

**3. Debounce detection events**
```javascript
// Prevent rapid fire detection
const debouncedDetection = debounce(detectPlatform, 1000);
```

---

## Diagnostic Tools

### PWA Test Suite
Access in development mode via Settings page:
- Platform detection results
- Installation status check
- Notification permission status  
- Service worker registration
- beforeinstallprompt availability

### Browser DevTools
**Chrome/Edge:**
```
DevTools → Application tab
- Manifest: Check PWA manifest
- Service Workers: Verify registration
- Storage: Check localStorage keys
```

**Safari:**
```
Develop → Web Inspector → Storage tab
- Local Storage: Check PWA flags
- Console: Look for PWA events
```

### Console Commands
```javascript
// Check PWA status
console.log('PWA installed:', window.matchMedia('(display-mode: standalone)').matches);

// Check notification permission
console.log('Notification permission:', Notification.permission);

// Check service worker
console.log('SW registered:', 'serviceWorker' in navigator);

// Test notification
new Notification('Test', { body: 'Test message' });
```

---

## Platform-Specific Testing

### iOS Testing Checklist
- [ ] Safari 16.4+ version confirmed
- [ ] Share button accessible
- [ ] "Add to Home Screen" appears in share menu
- [ ] App icon appears on home screen after install
- [ ] Notifications work when opened from home screen icon
- [ ] App behaves as standalone (no Safari UI)

### Android Testing Checklist  
- [ ] Chrome 88+ or Samsung Internet 13+
- [ ] beforeinstallprompt event fires
- [ ] Native install dialog appears
- [ ] App icon appears in home screen/app drawer
- [ ] Notifications work immediately after permission
- [ ] App appears in Android app settings

### Desktop Testing Checklist
- [ ] Supported browser version
- [ ] Install option in browser menu
- [ ] Desktop shortcut/dock icon created
- [ ] App launches as standalone window
- [ ] System notifications work
- [ ] Taskbar/dock integration

---

## Error Codes & Messages

### PWA_INSTALL_FAILED
```
Possible causes:
1. User cancelled installation
2. Browser doesn't support PWA
3. Manifest validation failed
4. Service worker registration failed
```

### NOTIFICATION_PERMISSION_DENIED
```
Possible causes:
1. User explicitly denied permission
2. Site previously blocked notifications
3. Browser policy prevents notifications
4. System notifications disabled
```

### PLATFORM_NOT_SUPPORTED
```
Possible causes:
1. Old browser version
2. iOS Chrome (not supported)
3. Private browsing mode
4. Browser flags disabled
```

---

## Escalation & Support

### When to Escalate
- Multiple users report same issue
- Platform-specific problems persist
- New browser version breaks functionality
- Security errors during installation

### Debug Information to Collect
```
User Agent: navigator.userAgent
Platform: detectPlatform()
PWA Status: isPWAInstalled()
Notification Permission: Notification.permission
Service Worker: navigator.serviceWorker.controller
Display Mode: window.matchMedia('(display-mode: standalone)').matches
```

### Recovery Procedures
1. **Reset PWA state**: Clear localStorage PWA keys
2. **Force refresh**: Hard reload (Ctrl+F5)
3. **Clear cache**: Browser cache and site data
4. **Restart browser**: Close and reopen completely
5. **System restart**: Last resort for desktop issues

---

**Last Updated**: November 5, 2025  
**Supported Platforms**: iOS 16.4+, Android 6+, Windows 10+, macOS 10.15+  
**Browser Support**: Chrome 88+, Safari 14+, Edge 88+, Firefox 90+ (limited)
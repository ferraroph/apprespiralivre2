#  PRD - PWA Installation Prompts & Cross-Platform Notifications

**Project:** Respira Livre - PWA Implementation  
**Branch:** App  
**Date:** November 5, 2025  
**Version:** 1.0  

---

##  EXECUTIVE SUMMARY

**Objetivo:** Implementar sistema completo de instalação PWA com prompts automáticos e notificações push funcionais em todas as plataformas (iOS 16.4+, Android, Windows, Mac).

**Escopo:** Desenvolver componentes de instalação PWA, hooks de detecção de plataforma, prompts cross-platform e integração com sistema de notificações existente.

**Branch de Desenvolvimento:** `App` (atual)

---

##  CURRENT STATE ANALYSIS

###  ALREADY IMPLEMENTED
- **PWA Manifest:** Configurado corretamente
- **Service Worker:** Web Push API implementado
- **Backend:** Web Push Protocol funcional
- **Frontend Hook:** usePushNotifications com Web Push API
- **Icons:** 192x192, 512x512, apple-touch-icon
- **Database Schema:** user_tokens com push_subscription

###  MISSING COMPONENTS
- **Installation Prompt Component:** Não existe
- **PWA Detection Hook:** Não implementado
- **iOS Instructions Banner:** Ausente
- **Install Button Integration:** Não configurado
- **Platform-specific UX:** Não diferenciado

---

## ️ TECHNICAL REQUIREMENTS

### **TODOS #1: PWA Detection Hook**

**File:** `src/hooks/usePWAInstall.tsx`

**Requirements:**
- Detectar evento `beforeinstallprompt`
- Gerenciar estado de instalação disponível
- Controlar timing do prompt
- Detectar se PWA já está instalado
- Gerenciar diferentes comportamentos por plataforma

**Interface:**
```typescript
interface PWAInstallHook {
  isInstallable: boolean;
  isInstalled: boolean;
  platform: 'ios' | 'android' | 'windows' | 'mac' | 'other';
  showInstallPrompt: () => Promise<boolean>;
  dismissPrompt: () => void;
  canShowPrompt: boolean;
}
```

**Platform Detection Logic:**
- **Android:** `beforeinstallprompt` available + Android user agent
- **iOS:** Safari + iOS user agent + não instalado
- **Windows:** `beforeinstallprompt` + Windows user agent  
- **Mac:** `beforeinstallprompt` + Mac user agent

---

### **TODOS #2: Install Prompt Component**

**File:** `src/components/InstallPrompt.tsx`

**Requirements:**
- Modal/Banner responsivo para prompt de instalação
- Diferentes layouts por plataforma
- Integração com usePWAInstall hook
- Animações de entrada/saída
- Botões de ação (Instalar/Dispensar)
- Tracking de eventos de instalação

**Design Specs:**
- **Android/Windows/Mac:** Modal com botão "Instalar App"
- **iOS:** Banner fixo com instruções step-by-step
- **Cores:** Seguir design system (theme colors)
- **Typography:** Inter font family
- **Icons:** Usar ícones do Lucide React

**Behavior:**
- Aparecer apenas quando `isInstallable = true`
- Auto-dismiss após instalação
- Respeitar user preference (não mostrar novamente se dispensado)
- LocalStorage para controlar frequency

---

### **TODOS #3: iOS Installation Instructions**

**File:** `src/components/IOSInstallInstructions.tsx`

**Requirements:**
- Component específico para iOS Safari
- Step-by-step visual instructions
- Detectar iOS version (16.4+ required)
- Animated walkthrough
- Screenshots/icons ilustrativos

**Content Requirements:**
```
1. Toque no ícone  "Compartilhar" na barra inferior
2. Role para baixo e toque em "Adicionar à Tela Inicial"
3. Toque em "Adicionar" no canto superior direito
4. O app aparecerá na sua tela inicial
```

**Visual Elements:**
- Safari share icon
- "Add to Home Screen" button mockup
- App icon preview
- Step indicators (1, 2, 3, 4)

---

### **TODOS #4: Platform Detection Utilities**

**File:** `src/lib/platform-detection.ts`

**Requirements:**
- Funções utilitárias para detecção de plataforma
- User agent parsing
- PWA installation status detection
- iOS version checking (16.4+ requirement)

**Functions:**
```typescript
export function detectPlatform(): Platform;
export function isIOSSupported(): boolean;
export function isPWAInstalled(): boolean;
export function canShowInstallPrompt(): boolean;
export function getIOSVersion(): number | null;
```

---

### **TODOS #5: Install Button Integration**

**File:** `src/components/layout/AppLayout.tsx`

**Requirements:**
- Integrar InstallPrompt no layout principal
- Conditional rendering baseado em platform
- Position strategy (modal vs banner)
- Z-index management
- Responsive behavior

**Integration Points:**
- Header navigation (optional install button)
- Floating action button (mobile)
- Modal overlay (desktop)
- Banner notification (iOS)

---

### **TODOS #6: Notification Permission Flow**

**File:** `src/components/NotificationSetupFlow.tsx`

**Requirements:**
- Guided flow para setup de notificações
- Integração com PWA installation
- Step-by-step onboarding
- Permission request optimization
- Error handling e fallbacks

**Flow Steps:**
1. Install PWA (se não instalado)
2. Request notification permission
3. Register push subscription
4. Confirmation e testing

---

### **TODOS #7: Settings Integration**

**File:** `src/pages/Settings.tsx`

**Requirements:**
- Seção PWA Installation status
- Manual install trigger
- Notification settings toggle
- Installation troubleshooting
- Platform-specific help

**UI Elements:**
- Installation status indicator
- "Install App" button (se disponível)
- "Reinstall App" option
- Platform detection display
- Notification permission status

---

### **TODOS #8: Analytics & Tracking**

**File:** `src/lib/pwa-analytics.ts`

**Requirements:**
- Track installation prompts shown
- Monitor installation success/failure rates
- Platform-specific conversion metrics
- Notification permission grants
- User engagement post-install

**Events to Track:**
- `pwa_prompt_shown`
- `pwa_install_success`
- `pwa_install_dismissed` 
- `notification_permission_granted`
- `notification_permission_denied`

---

##  IMPLEMENTATION STRATEGY

### **Phase 1: Core PWA Detection (TODOS #1, #4)**
**Duration:** 2 hours  
**Dependencies:** None  
**Deliverables:**
- usePWAInstall hook functional
- Platform detection utilities
- Basic install prompt triggering

### **Phase 2: UI Components (TODOS #2, #3)**
**Duration:** 3 hours  
**Dependencies:** Phase 1  
**Deliverables:**
- InstallPrompt component responsive
- iOS instructions component
- Cross-platform UI testing

### **Phase 3: Integration (TODOS #5, #6)**
**Duration:** 2 hours  
**Dependencies:** Phase 1, 2  
**Deliverables:**
- AppLayout integration
- Notification flow connection
- End-to-end testing

### **Phase 4: Enhancement (TODOS #7, #8)**
**Duration:** 1 hour  
**Dependencies:** Phase 1, 2, 3  
**Deliverables:**
- Settings page updates
- Analytics implementation
- Performance optimization

---

##  PLATFORM-SPECIFIC BEHAVIOR

### **Android Chrome/Edge**
**Experience:**
1. User visits site
2. `beforeinstallprompt` fires automatically
3. InstallPrompt modal appears
4. User clicks "Instalar Respira Livre"
5. Native install dialog appears
6. App installs to home screen
7. Notifications work immediately

### **iOS Safari 16.4+**
**Experience:**
1. User visits site  
2. iOS detection triggers
3. IOSInstallInstructions banner appears
4. User follows step-by-step guide
5. App adds to home screen
6. User opens PWA from home screen
7. Notifications work after PWA launch

### **Windows Chrome/Edge**
**Experience:**
1. Same as Android
2. App installs to taskbar + start menu
3. Desktop shortcut created
4. Notifications via Windows notification center

### **Mac Safari/Chrome**
**Experience:**
1. Same as Android (Chrome) or iOS-like (Safari)
2. App installs to Dock
3. Notifications via macOS notification center

---

##  TESTING REQUIREMENTS

### **TODOS #9: Cross-Platform Testing**

**Test Matrix:**
-  Android Chrome (latest)
-  Android Samsung Internet
-  iOS Safari 16.4+
-  Windows Chrome/Edge
-  Mac Safari/Chrome
-  Desktop Firefox (limited support)

**Test Scenarios:**
1. **Install Prompt Display:** Correct timing e appearance
2. **Installation Process:** End-to-end flow success
3. **Notification Permission:** Request e grant flow
4. **Post-Install Behavior:** App launches e notifications work
5. **Edge Cases:** Already installed, permission denied, etc.

### **TODOS #10: User Acceptance Testing**

**Criteria:**
- [ ] Install prompt appears within 10 seconds on supported platforms
- [ ] Installation completes in under 30 seconds
- [ ] App icon appears correctly on home screen/taskbar
- [ ] Notifications work within 5 seconds of permission grant
- [ ] iOS users successfully follow manual instructions
- [ ] No console errors during installation flow

---

##  SUCCESS METRICS

### **Technical KPIs**
- **Install Prompt Show Rate:** >80% on supported platforms
- **Installation Conversion:** >30% of prompts result in install
- **Notification Permission Grant:** >60% after PWA install
- **Installation Success Rate:** >95% on supported platforms
- **Error Rate:** <5% across all flows

### **User Experience KPIs**
- **Time to Install:** <30 seconds average
- **iOS Manual Install Success:** >40% completion rate
- **Post-Install Engagement:** >70% open app within 24h
- **Notification Engagement:** >20% click-through rate

---

##  RISK MITIGATION

### **Technical Risks**
- **iOS Safari Changes:** Apple pode alterar PWA behavior
  - *Mitigation:* Graceful degradation, regular testing
- **Browser Compatibility:** beforeinstallprompt support varies
  - *Mitigation:* Feature detection, fallback UX
- **Notification Reliability:** Web Push pode falhar
  - *Mitigation:* Retry logic, error handling

### **UX Risks**  
- **User Confusion:** iOS manual install pode ser complexo
  - *Mitigation:* Clear instructions, visual aids
- **Permission Fatigue:** Usuários podem negar notificações
  - *Mitigation:* Contextual requests, value explanation
- **Installation Abandonment:** Users podem cancelar processo
  - *Mitigation:* Progress indicators, motivational copy

---

##  DEFINITION OF DONE

### **TODOS #11: Acceptance Criteria**

**For Each Component:**
- [ ] TypeScript sem errors
- [ ] Responsive design (mobile-first)
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Error handling implementado
- [ ] Loading states definidos
- [ ] Analytics tracking ativo
- [ ] Cross-browser testing passed
- [ ] Performance benchmarks met (<100ms interaction)

**For Overall Feature:**
- [ ] PWA installable em todas as plataformas target
- [ ] Notificações funcionais post-install
- [ ] Graceful degradation em browsers não suportados  
- [ ] User can successfully complete install flow
- [ ] Analytics capturing all key events
- [ ] Documentation atualizada
- [ ] Code review aprovado
- [ ] QA testing passed

---

##  DOCUMENTATION REQUIREMENTS

### **TODOS #12: Documentation Updates**

**Files to Update:**
- `README.md` - PWA installation instructions
- `docs/PWA-SETUP.md` - Technical implementation guide
- `docs/PLATFORM-SUPPORT.md` - Platform compatibility matrix
- `docs/TROUBLESHOOTING.md` - Common issues e solutions

**Content Requirements:**
- Step-by-step installation guide per platform
- Developer setup instructions
- API documentation for new hooks
- Component usage examples
- Browser compatibility notes

---

##  DEPLOYMENT STRATEGY

### **Branch Strategy**
- **Development:** `App` (current)
- **Testing:** Feature branch `pwa-install-prompts`
- **Production:** Merge to `main` after QA approval

### **Rollout Plan**
1. **Internal Testing:** Dev team validation
2. **Beta Testing:** Limited user group (iOS focus)
3. **Gradual Rollout:** 25% → 50% → 100% traffic
4. **Monitoring:** Real-time analytics e error tracking

### **Rollback Plan**
- Feature flags para disable install prompts
- Quick revert capability via environment variables
- Graceful degradation to current behavior

---

##  TIMELINE & MILESTONES

### **Sprint Planning**
- **Week 1:** TODOS #1-4 (Core functionality)
- **Week 2:** TODOS #5-8 (Integration e enhancement)  
- **Week 3:** TODOS #9-12 (Testing e documentation)

### **Key Milestones**
- **Day 1:** PWA detection working
- **Day 3:** Install prompts functional
- **Day 5:** Cross-platform testing complete
- **Day 7:** Production deployment ready

---

##  FINAL SUCCESS CRITERIA

**The implementation is successful when:**

 **Android/Windows/Mac users** see install prompt automatically  
 **iOS users** receive clear instructions e can install manually  
 **All installed PWAs** display notifications correctly  
 **Installation rates** meet or exceed 30% conversion  
 **No critical errors** in production deployment  
 **User experience** is smooth across all platforms  

**Ready for implementation in branch `App`** 
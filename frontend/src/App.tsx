/**
 * GAMEON TELE - Official telebirr SuperApp Game Center
 * Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { usePortalState } from './hooks/usePortalState';
import { GameRegistry } from './games/registry';
import { GameDefinition } from './types';
import { EntitlementService } from './services/entitlementService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NotificationToast } from './components/NotificationToast';
import { GoDigitalLogo } from './components/GoDigitalLogo';
import { CinematicPortalBackground } from './components/CinematicPortalBackground';

// Modals
import { GameLauncherModal } from './components/GameLauncherModal';
import { GameAccessModal } from './components/GameAccessModal';
import { CoinTopupModal } from './components/CoinTopupModal';
import { GameDetailsModal } from './components/GameDetailsModal';
import { TermsAndPrivacyModal } from './components/TermsAndPrivacyModal';
import { MainMenuDrawer, MainMenuSection } from './components/MainMenuDrawer';
import { PortalSectionId } from './utils/navigationConfig';
import { NotificationModal } from './components/NotificationModal';
import { notificationService, NotificationItem } from './services/notificationService';

// Pages
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { TournamentPage } from './pages/TournamentPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyGamesPage } from './pages/content/MyGamesPage';
import { FAQPage } from './pages/content/FAQPage';
import { HelpSupportPage } from './pages/content/HelpSupportPage';
import { SubscriptionPage } from './pages/content/SubscriptionPage';
import { PricingPage } from './pages/content/PricingPage';
import { TermsPage } from './pages/content/TermsPage';
import { PrivacyPage } from './pages/content/PrivacyPage';
import { MyScoresPage } from './pages/content/MyScoresPage';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    language,
    changeLanguage,
    t,
    // Game Launcher State
    activeGameToLaunch,
    launchGame,
    closeGameLauncher,
    handleGameFinished,
    lastGameSessionResult,
    // Modals
    isLegalModalOpen,
    setIsLegalModalOpen,
    legalModalTab,
    openLegalModal,
    // Actions
    resetDemoState,
    wipeAccountData,
    signOut,
    // Settings & Toasts
    audioEnabled,
    toasts,
    showToast,
    dismissToast,
  } = usePortalState();

  const [isAppLaunching, setIsAppLaunching] = useState(true);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [contentView, setContentView] = useState<MainMenuSection | null>(null);
  const [profileResetKey, setProfileResetKey] = useState(0);

  // Notification Center State
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  // Game Access & Modals State
  const [pendingAccessGame, setPendingAccessGame] = useState<GameDefinition | null>(null);
  const [isCoinTopupOpen, setIsCoinTopupOpen] = useState(false);
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<GameDefinition | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All Games');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLaunching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch notifications and subscribe to real-time Server-Sent Events (SSE)
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const loadAndSubscribe = async () => {
      if (!profile?.phoneNumber) {
        setNotifications([]);
        setUnreadNotificationsCount(0);
        return;
      }
      const userPhone = profile.phoneNumber;
      const initial = await notificationService.fetchNotifications(userPhone);
      setNotifications(initial.notifications);
      setUnreadNotificationsCount(initial.unreadCount);

      unsubscribe = notificationService.subscribeRealtime(
        userPhone,
        (newNotif) => {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === newNotif.id);
            if (exists) return prev;
            return [newNotif, ...prev];
          });
          setUnreadNotificationsCount((prev) => prev + 1);
        },
        (updatedCount) => {
          setUnreadNotificationsCount(updatedCount);
        }
      );
    };

    loadAndSubscribe();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [profile?.phoneNumber]);

  // Handle browser / platform back button across modals, content view, and menu drawer
  useEffect(() => {
    const handlePopState = () => {
      if (activeGameToLaunch !== null) {
        closeGameLauncher();
        return;
      }
      if (isCoinTopupOpen) {
        setIsCoinTopupOpen(false);
        return;
      }
      if (selectedGameForDetails !== null) {
        setSelectedGameForDetails(null);
        return;
      }
      if (pendingAccessGame !== null) {
        setPendingAccessGame(null);
        return;
      }
      if (isNotificationModalOpen) {
        setIsNotificationModalOpen(false);
        return;
      }
      if (isMainMenuOpen) {
        setIsMainMenuOpen(false);
        return;
      }
      if (contentView !== null) {
        setContentView(null);
        return;
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    activeGameToLaunch,
    isCoinTopupOpen,
    selectedGameForDetails,
    pendingAccessGame,
    contentView,
    isMainMenuOpen,
    isNotificationModalOpen,
    closeGameLauncher,
  ]);

  const handleOpenNotifications = () => {
    window.history.pushState({ notificationsOpen: true }, '');
    setIsNotificationModalOpen(true);
  };

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    await notificationService.markAsRead(id);
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadNotificationsCount(0);
    if (profile?.phoneNumber) {
      await notificationService.markAllAsRead(profile.phoneNumber);
    }
  };

  const handleNotificationAction = (url: string) => {
    if (url === '/tournament' || url.includes('tournament')) {
      setActiveTab('tournament');
    } else if (url === '/leaderboard' || url.includes('leaderboard')) {
      setActiveTab('leaderboard');
    } else if (url === '/profile' || url.includes('profile')) {
      setActiveTab('profile');
    } else if (url === '/games' || url.includes('games')) {
      setActiveTab('games');
    } else if (url.includes('helix') || url.includes('helix-jump')) {
      const helix = GameRegistry.getGameById('helix-jump');
      if (helix) handlePlayGame(helix);
    } else if (url.includes('coins') || url.includes('topup')) {
      setIsCoinTopupOpen(true);
    }
  };

  const handleOpenMainMenu = () => {
    window.history.pushState({ menuOpen: true }, '');
    setIsMainMenuOpen(true);
  };

  const handleCloseMainMenu = () => {
    setIsMainMenuOpen(false);
    if (window.history.state?.menuOpen) {
      window.history.back();
    }
  };

  const navigateToContentSection = (section: MainMenuSection) => {
    setIsMainMenuOpen(false);
    if (window.history.state?.menuOpen) {
      window.history.replaceState({ contentView: section }, '');
    } else {
      window.history.pushState({ contentView: section }, '');
    }
    setContentView(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromContent = () => {
    setContentView(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allGames = GameRegistry.getAllGames();

  // Active access map for all games
  const activeEntitlements = allGames.reduce((acc, g) => {
    acc[g.id] = EntitlementService.checkAccess(g.id, profile).hasAccess;
    return acc;
  }, {} as Record<string, boolean>);

  /**
   * Centralized Game Play Controller:
   * Checks access entitlement -> if authorized, launches game;
   * If not, prompts GameAccessModal for telebirr authorization or coin payment.
   */
  const handlePlayGame = (game: GameDefinition) => {
    const accessCheck = EntitlementService.checkAccess(game.id, profile);
    if (accessCheck.hasAccess) {
      EntitlementService.recordGamePlayed(game.id);
      launchGame(game);
    } else {
      setPendingAccessGame(game);
    }
  };

  const handleAccessGranted = (updatedProfile: typeof profile, gameToPlay: GameDefinition) => {
    setProfile(updatedProfile);
    setPendingAccessGame(null);
    EntitlementService.recordGamePlayed(gameToPlay.id);
    showToast('success', `Access granted to ${gameToPlay.title}!`, 'telebirr Authorized');
    launchGame(gameToPlay);
  };

  // Splash Screen
  if (isAppLaunching) {
    return (
      <div className="fixed inset-0 z-50 bg-[#24170F] text-[#FFF0CF] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
        <div className="bg-[#352316] border border-[#81502B] p-4 rounded-3xl shadow-2xl mb-4 flex items-center justify-center">
          <GoDigitalLogo size="xl" showSubtitle={true} />
        </div>
        <p className="text-xs text-[#E6C8A4] font-medium tracking-wider uppercase mt-1">Official Gaming Portal</p>
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFD35A] animate-bounce shadow-[0_0_8px_rgba(255,211,90,0.7)]" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFAA24] animate-bounce shadow-[0_0_8px_rgba(255,170,36,0.7)]" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F47B20] animate-bounce shadow-[0_0_8px_rgba(244,123,32,0.7)]" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#24170F] text-[#FFF0CF] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#FFAA24] selection:text-[#24170F] relative">
      {/* Cinematic Adventure-Gaming Sunset Background */}
      <CinematicPortalBackground />
      
      {/* 1. Global Native Mini-App Header */}
      <Header
        profile={profile}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
        onOpenMenu={handleOpenMainMenu}
        onOpenNotifications={handleOpenNotifications}
      />

      {/* 2. Main Dynamic Content Area */}
      <main className="flex-1 w-full">
        {/* Content Pages from Main Menu & Profile */}
        {(contentView === 'my_games' || (contentView as string) === 'games') && (
          <div className="py-2">
            <MyGamesPage
              games={allGames}
              profile={profile}
              onPlayGame={handlePlayGame}
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'faq' && (
          <div className="py-2">
            <FAQPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'help_support' && (
          <div className="py-2">
            <HelpSupportPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'subscription' && (
          <div className="py-2">
            <SubscriptionPage
              onBack={handleBackFromContent}
              showHeader={true}
              profile={profile}
              onProfileUpdate={setProfile}
            />
          </div>
        )}

        {contentView === 'pricing' && (
          <div className="py-2">
            <PricingPage
              onBack={handleBackFromContent}
              showHeader={true}
              onBuyCoins={() => setIsCoinTopupOpen(true)}
            />
          </div>
        )}

        {contentView === 'terms' && (
          <div className="py-2">
            <TermsPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'privacy' && (
          <div className="py-2">
            <PrivacyPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'my_scores' && (
          <div className="py-2">
            <MyScoresPage
              profile={profile}
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {/* Tab Views (Active when no top-level content view is open) */}
        {contentView === null && (
          <>
            {activeTab === 'home' && (
              <HomePage
                games={allGames}
                profile={profile}
                onLaunchGame={handlePlayGame}
                onOpenDetails={(g) => setSelectedGameForDetails(g)}
                onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
                onNavigateToGames={(category) => {
                  setSelectedCategoryFilter(category || 'All Games');
                  setActiveTab('games');
                }}
                onNavigateToTournament={() => setActiveTab('tournament')}
                activeEntitlements={activeEntitlements}
              />
            )}

            {activeTab === 'games' && (
              <GamesPage
                games={allGames}
                profile={profile}
                onLaunchGame={handlePlayGame}
                initialCategory={selectedCategoryFilter}
                activeEntitlements={activeEntitlements}
              />
            )}

            {activeTab === 'tournament' && (
              <TournamentPage
                profile={profile}
                onPlayGame={handlePlayGame}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardPage
                profile={profile}
                games={allGames}
                onPlayGame={handlePlayGame}
              />
            )}

            {activeTab === 'profile' && (
              <ProfilePage
                key={`profile-page-${profileResetKey}`}
                profile={profile}
                games={allGames}
                language={language}
                onLanguageChange={changeLanguage}
                onPlayGame={handlePlayGame}
                onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
                onProfileUpdate={setProfile}
                onOpenMenu={handleOpenMainMenu}
                onNavigateToSection={navigateToContentSection}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Main Menu Drawer */}
      <MainMenuDrawer
        isOpen={isMainMenuOpen}
        onClose={handleCloseMainMenu}
        onSelectSection={navigateToContentSection}
        activeSection={contentView}
      />

      {/* 4. Mobile-First Bottom Navigation Bar (5 Tabs) */}
      <BottomNav
        activeTab={contentView ? ('' as any) : activeTab}
        onTabChange={(tab) => {
          if (isMainMenuOpen) {
            handleCloseMainMenu();
          }
          if (contentView) {
            setContentView(null);
          }
          if (tab === 'profile' && activeTab === 'profile' && !contentView) {
            setProfileResetKey((k) => k + 1);
          }
          setActiveTab(tab);
        }}
        labels={{
          home: 'Home',
          games: 'Game',
          tournament: 'Tournament',
          leaderboard: 'Leaderboard',
          profile: 'Profile',
        }}
      />

      {/* 5. Game Access & Entitlement Modal */}
      {pendingAccessGame && (
        <GameAccessModal
          game={pendingAccessGame as any}
          profile={profile}
          isOpen={Boolean(pendingAccessGame)}
          onClose={() => setPendingAccessGame(null)}
          onAuthorizedPlay={(g) => handleAccessGranted(profile, g as any)}
          onOpenCoinTopup={() => setIsCoinTopupOpen(true)}
          onProfileUpdate={setProfile}
        />
      )}

      {/* 6. Coin Topup Modal (telebirr Instant Wallet Billing) */}
      <CoinTopupModal
        isOpen={isCoinTopupOpen}
        onClose={() => setIsCoinTopupOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />

      {/* 7. Game Details Modal */}
      {selectedGameForDetails && (
        <GameDetailsModal
          game={selectedGameForDetails}
          isOpen={Boolean(selectedGameForDetails)}
          onClose={() => setSelectedGameForDetails(null)}
          onPlayGame={handlePlayGame}
          hasActiveAccess={Boolean(activeEntitlements[selectedGameForDetails.id])}
        />
      )}

      {/* 8. Fullscreen Game Launcher / Active Game Session Modal */}
      {activeGameToLaunch && (
        <GameLauncherModal
          game={activeGameToLaunch}
          profile={profile}
          lastResult={lastGameSessionResult}
          onClose={closeGameLauncher}
          onGameOver={handleGameFinished}
          onPlayAgain={() => {
            const currentGame = activeGameToLaunch;
            closeGameLauncher();
            setTimeout(() => handlePlayGame(currentGame), 100);
          }}
          isAudioEnabled={audioEnabled}
        />
      )}

      {/* 9. Legal, Terms & Privacy Modal */}
      {isLegalModalOpen && (
        <TermsAndPrivacyModal
          initialTab={legalModalTab}
          onClose={() => setIsLegalModalOpen(false)}
          onConfirmDeleteAccount={wipeAccountData}
        />
      )}

      {/* 10. Real-time Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        unreadCount={unreadNotificationsCount}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigateAction={handleNotificationAction}
      />

      {/* 11. Floating Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

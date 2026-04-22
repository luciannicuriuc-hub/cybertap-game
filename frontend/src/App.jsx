import { useEffect, useRef, useState } from 'react';
import { api } from './lib/api';

const appName = import.meta.env.APP_NAME || import.meta.env.VITE_APP_NAME || 'CyberTap';
const botName = (import.meta.env.TELEGRAM_BOT_NAME || import.meta.env.VITE_TELEGRAM_BOT_NAME || '').replace(/^@/, '').trim();
const demoTelegramId = Number(import.meta.env.DEMO_TELEGRAM_ID || import.meta.env.VITE_DEMO_TELEGRAM_ID || 12345);
const UPGRADES_CONFIG = {
  tap: [
    { id: 'multi_tap', name: 'Multi-Tap', description: '+1 point per tap', icon: '🖱️', baseCost: 500, costMult: 1.5, maxLevel: 50, effect: '+1 tap' },
    { id: 'energy_max', name: 'Energy Tank', description: '+500 max energy', icon: '🔋', baseCost: 1000, costMult: 1.4, maxLevel: 30, effect: '+500 energy' },
    { id: 'energy_regen', name: 'Power Supply', description: '+1 energy/sec regen', icon: '⚡', baseCost: 2000, costMult: 1.6, maxLevel: 20, effect: '+1/sec' },
    { id: 'critical_tap', name: 'Critical Strike', description: '+5% critical hit chance', icon: '💥', baseCost: 5000, costMult: 1.8, maxLevel: 15, effect: '+5% crit' },
  ],
  passive: [
    { id: 'gpu_basic', name: 'Basic GPU', description: '+10 points/hour', icon: '🖥️', baseCost: 1000, costMult: 1.3, maxLevel: 100, effect: '+10/hr' },
    { id: 'server_rack', name: 'Server Rack', description: '+50 points/hour', icon: '🗄️', baseCost: 5000, costMult: 1.35, maxLevel: 50, effect: '+50/hr' },
    { id: 'data_center', name: 'Data Center', description: '+200 points/hour', icon: '🏢', baseCost: 25000, costMult: 1.4, maxLevel: 30, effect: '+200/hr' },
    { id: 'bot_network', name: 'Bot Network', description: '+500 points/hour', icon: '🤖', baseCost: 100000, costMult: 1.45, maxLevel: 20, effect: '+500/hr' },
    { id: 'ai_system', name: 'AI Supercomputer', description: '+2000 points/hour', icon: '🧠', baseCost: 500000, costMult: 1.5, maxLevel: 15, effect: '+2000/hr' },
    { id: 'quantum_cpu', name: 'Quantum CPU', description: '+5000 points/hour', icon: '🧩', baseCost: 2000000, costMult: 1.6, maxLevel: 10, effect: '+5000/hr' },
  ],
  special: [
    { id: 'vpn_premium', name: 'VPN Premium', description: '+10% to all earnings', icon: '🛡️', baseCost: 50000, costMult: 2.0, maxLevel: 5, effect: '+10% all', requires: '3 referrals' },
    { id: 'dark_web', name: 'Dark Web Access', description: '+15% passive income', icon: '🕸️', baseCost: 100000, costMult: 2.0, maxLevel: 5, effect: '+15% passive', requires: '7 day streak' },
    { id: 'ai_assistant', name: 'AI Assistant', description: 'Auto-tap 1/sec offline', icon: '🛰️', baseCost: 200000, costMult: 2.0, maxLevel: 5, effect: '+auto tap', requires: '10 referrals' },
  ],
};

const LEAGUES = [
  { name: 'Bronze', icon: '🥉', min: 0 },
  { name: 'Silver', icon: '🥈', min: 10000 },
  { name: 'Gold', icon: '🥇', min: 50000 },
  { name: 'Diamond', icon: '💎', min: 200000 },
  { name: 'Elite', icon: '⭐', min: 1000000 },
  { name: 'Legendary', icon: '🔥', min: 10000000 },
  { name: 'Mythic', icon: '👑', min: 100000000 },
];

const REFERRAL_MILESTONES = [
  { count: 1, reward: 500, bonus: null, icon: '👤' },
  { count: 3, reward: 2000, bonus: '🛡️ VPN Premium', icon: '👥' },
  { count: 5, reward: 5000, bonus: '🎖️ Recruiter Badge', icon: '🏷️' },
  { count: 10, reward: 15000, bonus: '🛰️ AI Assistant', icon: '🤖' },
  { count: 25, reward: 50000, bonus: '✨ Exclusive Skin', icon: '🎨' },
  { count: 50, reward: 150000, bonus: '🏆 Network Master', icon: '🧠' },
  { count: 100, reward: 500000, bonus: 'VIP Status', icon: '👑' },
];

const DAILY_MISSIONS = [
  { id: 'login', name: 'Daily Check-in', desc: 'Open the game today', icon: '📅', target: 1, reward: 100, type: 'login' },
  { id: 'taps_1k', name: 'Tap Apprentice', desc: 'Tap 1,000 times today', icon: '🖱️', target: 1000, reward: 300, type: 'taps' },
  { id: 'taps_5k', name: 'Tap Master', desc: 'Tap 5,000 times today', icon: '🏆', target: 5000, reward: 1000, type: 'taps' },
  { id: 'upgrade_1', name: 'Smart Investor', desc: 'Purchase 1 upgrade', icon: '🛒', target: 1, reward: 300, type: 'upgrades' },
  { id: 'collect_3', name: 'Profit Collector', desc: 'Collect income 3 times', icon: '💸', target: 3, reward: 400, type: 'collections' },
  { id: 'wheel', name: 'Lucky Spinner', desc: 'Spin the daily wheel', icon: '🎡', target: 1, reward: 200, type: 'wheel_spin' },
];

const WEEKLY_MISSIONS = [
  { id: 'weekly_login', name: 'Weekly Warrior', desc: 'Login 7 days in a row', icon: '📈', target: 7, reward: 10000, type: 'streak' },
  { id: 'weekly_taps', name: 'Mega Tapper', desc: 'Tap 50,000 times this week', icon: '⚔️', target: 50000, reward: 5000, type: 'taps' },
  { id: 'weekly_upgrade', name: 'Upgrade Spree', desc: 'Buy 10 upgrades this week', icon: '🛠️', target: 10, reward: 8000, type: 'upgrades' },
  { id: 'weekly_invite', name: 'Team Builder', desc: 'Invite 5 friends this week', icon: '👥', target: 5, reward: 15000, type: 'referrals' },
];

const WHEEL_SEGMENTS = [
  { label: '100', points: 100, special: null, color: '#ff6b6b' },
  { label: '250', points: 250, special: null, color: '#4ecdc4' },
  { label: '500', points: 500, special: null, color: '#45b7d1' },
  { label: '1K', points: 1000, special: null, color: '#96ceb4' },
  { label: '2.5K', points: 2500, special: null, color: '#ffeaa7' },
  { label: '5K', points: 5000, special: null, color: '#dda0dd' },
  { label: 'ENERGY', points: 0, special: 'energy_full', color: '#00d4ff' },
  { label: '2X', points: 0, special: 'boost_2x', color: '#8b5cf6' },
  { label: '10K', points: 10000, special: null, color: '#ffd700' },
  { label: 'JACKPOT', points: 50000, special: 'jackpot', color: '#ff4500' },
];

const LAMPORTS_PER_SOL = 1000000000;

function formatNumber(num) {
  const value = Math.floor(Number(num) || 0);
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

function formatSol(lamports) {
  const value = Math.max(0, Number(lamports) || 0);
  return `${(value / LAMPORTS_PER_SOL).toFixed(value >= 1000000 ? 4 : 6)} SOL`;
}

function shortenAddress(address) {
  const text = String(address || '');
  if (text.length <= 12) return text;
  return `${text.slice(0, 4)}...${text.slice(-4)}`;
}

function getLeague(points) {
  let current = LEAGUES[0];
  for (const league of LEAGUES) {
    if (points >= league.min) current = league;
    else break;
  }
  return current;
}

function updateRefState(setter, ref, updater) {
  setter((value) => {
    const next = typeof updater === 'function' ? updater(value) : updater;
    ref.current = next;
    return next;
  });
}

function getUpgradeEffectText(upgrade) {
  const effectValue = Number(upgrade.effect_per_level || 0);

  switch (upgrade.effect_type) {
    case 'tap_value':
      return `+${effectValue} / tap`;
    case 'max_energy':
      return `+${effectValue} max energy`;
    case 'energy_regen':
      return `+${effectValue}/sec regen`;
    case 'critical_chance':
      return `+${effectValue}% crit`;
    case 'passive_income':
      return `+${formatNumber(effectValue)} / hour`;
    case 'bonus_percent':
      return `+${effectValue}% bonus`;
    default:
      return upgrade.description || `+${formatNumber(effectValue)} effect`;
  }
}

function isUpgradeUnlocked(upgrade, referralCount, streak) {
  if (!upgrade.requires) return true;
  const required = Number.parseInt(upgrade.requires, 10) || 0;
  if (upgrade.requires.includes('referral')) return referralCount >= required;
  if (upgrade.requires.includes('streak')) return streak >= required;
  return true;
}

function getMissionProgress(mission, state) {
  switch (mission.type) {
    case 'login':
      return 1;
    case 'taps':
      return state.todayTaps;
    case 'upgrades':
      return state.todayUpgrades;
    case 'collections':
      return state.todayCollections;
    case 'wheel_spin':
      return state.wheelSpunToday ? 1 : 0;
    case 'streak':
      return state.streak;
    case 'referrals':
      return state.referralCount;
    default:
      return 0;
  }
}

function buildReferralLink(botUsername, telegramId) {
  const resolved = String(botUsername || botName || '').replace(/^@/, '').trim();
  if (!resolved) return 'Loading...';
  return `https://t.me/${resolved}?start=${telegramId}`;
}

function App() {
  const [telegramId, setTelegramId] = useState(null);
  const [username, setUsername] = useState('@player');
  const [points, setPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsPerHour, setPointsPerHour] = useState(0);
  const [tapValue, setTapValue] = useState(1);
  const [criticalChance, setCriticalChance] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const [maxEnergy, setMaxEnergy] = useState(1000);
  const [energyRegen, setEnergyRegen] = useState(1);
  const [streak, setStreak] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [upgradeLevels, setUpgradeLevels] = useState({});
  const [todayTaps, setTodayTaps] = useState(0);
  const [todayUpgrades, setTodayUpgrades] = useState(0);
  const [todayCollections, setTodayCollections] = useState(0);
  const [wheelSpunToday, setWheelSpunToday] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [currentShopCategory, setCurrentShopCategory] = useState('tap');
  const [currentLeaderboardType, setCurrentLeaderboardType] = useState('global');
  const [currentMissionType, setCurrentMissionType] = useState('daily');
  const [leaderboard, setLeaderboard] = useState([]);
  const [referralLink, setReferralLink] = useState('Loading...');
  const [userRank, setUserRank] = useState('#--');
  const [backendHealth, setBackendHealth] = useState('checking');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  const [offlineVisible, setOfflineVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('game');
  const [floaters, setFloaters] = useState([]);
  const [levelPopup, setLevelPopup] = useState('');
  const [toast, setToast] = useState({ show: false, icon: 'ℹ️', message: '' });
  const [modal, setModal] = useState({ show: false, icon: '🎁', title: 'Congratulations!', text: 'You received a reward!' });
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [tapStatusText, setTapStatusText] = useState('TAP TO HACK');
  const [tapCritical, setTapCritical] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [boostMultiplier, setBoostMultiplier] = useState(1);
  const [boostExpires, setBoostExpires] = useState(null);
  const [copyLabel, setCopyLabel] = useState('Copy Link');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletVerifiedAt, setWalletVerifiedAt] = useState(0);
  const [walletLinking, setWalletLinking] = useState(false);
  const [walletClaiming, setWalletClaiming] = useState(false);
  const [revenueEarnedLamports, setRevenueEarnedLamports] = useState(0);
  const [revenueClaimedLamports, setRevenueClaimedLamports] = useState(0);
  const [walletClaimCount, setWalletClaimCount] = useState(0);
  const [walletLastClaimAmountLamports, setWalletLastClaimAmountLamports] = useState(0);
  const [revenueLastClaimSignature, setRevenueLastClaimSignature] = useState('');
  const [walletManualMode, setWalletManualMode] = useState(false);
  const [walletLinkChallenge, setWalletLinkChallenge] = useState('');
  const [walletLinkChallengeExpiresAt, setWalletLinkChallengeExpiresAt] = useState(0);
  const [walletManualAddress, setWalletManualAddress] = useState('');
  const [walletManualSignature, setWalletManualSignature] = useState('');

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(0);
  const particlesRef = useRef([]);
  const pendingTapsRef = useRef(0);
  const holdIntervalRef = useRef(null);
  const comboCountRef = useRef(0);
  const offlineCollectTimerRef = useRef(null);
  const passiveTimerRef = useRef(null);
  const tapSyncTimerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const levelPopupTimerRef = useRef(null);
  const modalTimerRef = useRef(null);
  const copyTimerRef = useRef(null);
  const wheelTimerRef = useRef(null);

  const telegramIdRef = useRef(null);
  const pointsRef = useRef(0);
  const totalPointsRef = useRef(0);
  const pointsPerHourRef = useRef(0);
  const tapValueRef = useRef(1);
  const criticalChanceRef = useRef(0);
  const energyRef = useRef(1000);
  const maxEnergyRef = useRef(1000);
  const energyRegenRef = useRef(1);
  const streakRef = useRef(0);
  const referralCountRef = useRef(0);
  const upgradeLevelsRef = useRef({});
  const todayTapsRef = useRef(0);
  const todayUpgradesRef = useRef(0);
  const todayCollectionsRef = useRef(0);
  const wheelSpunTodayRef = useRef(false);
  const dailyClaimedRef = useRef(false);
  const boostActiveRef = useRef(false);
  const boostMultiplierRef = useRef(1);
  const boostExpiresRef = useRef(null);

  const walletClaimableLamports = Math.max(0, revenueEarnedLamports - revenueClaimedLamports);
  const walletLinked = Boolean(walletAddress && walletVerifiedAt);
  const walletStatusLabel = walletLinked ? 'Linked' : walletAddress ? 'Connected' : 'Not connected';

  useEffect(() => {
    const provider = window.solana;
    if (!provider?.isPhantom && !provider?.isSolflare) {
      setWalletManualMode(true);
    }
  }, []);

  useEffect(() => {
    document.title = appName;

    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();

      const user = webApp.initDataUnsafe?.user;
      if (user) {
        setTelegramId(user.id);
        setUsername(`@${user.username || user.first_name}`);
        return;
      }
    }

    setTelegramId(demoTelegramId);
    setUsername('@test_user');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBackendHealth() {
      const response = await api.ping();
      if (cancelled) return;

      if (response.ok && response.data?.status === 'ok') {
        setBackendHealth('online');
        return;
      }

      if (response.ok && response.data?.status === 'degraded') {
        setBackendHealth('degraded');
        return;
      }

      setBackendHealth('offline');
    }

    loadBackendHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    telegramIdRef.current = telegramId;
    pointsRef.current = points;
    totalPointsRef.current = totalPoints;
    pointsPerHourRef.current = pointsPerHour;
    tapValueRef.current = tapValue;
    criticalChanceRef.current = criticalChance;
    energyRef.current = energy;
    maxEnergyRef.current = maxEnergy;
    energyRegenRef.current = energyRegen;
    streakRef.current = streak;
    referralCountRef.current = referralCount;
    upgradeLevelsRef.current = upgradeLevels;
    todayTapsRef.current = todayTaps;
    todayUpgradesRef.current = todayUpgrades;
    todayCollectionsRef.current = todayCollections;
    wheelSpunTodayRef.current = wheelSpunToday;
    dailyClaimedRef.current = dailyClaimed;
    boostActiveRef.current = boostActive;
    boostMultiplierRef.current = boostMultiplier;
    boostExpiresRef.current = boostExpires;
  }, [telegramId, points, totalPoints, pointsPerHour, tapValue, criticalChance, energy, maxEnergy, energyRegen, streak, referralCount, upgradeLevels, todayTaps, todayUpgrades, todayCollections, wheelSpunToday, dailyClaimed, boostActive, boostMultiplier, boostExpires]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function animate() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0);

      for (const particle of particlesRef.current) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.speedY += particle.gravity;
        particle.life -= particle.decay;
        if (particle.type !== 'fire') {
          particle.size *= 0.97;
        }

        context.save();
        context.globalAlpha = Math.max(particle.life, 0);
        context.fillStyle = particle.color;
        context.shadowBlur = particle.type === 'cyber' ? 5 : 15;
        context.shadowColor = particle.color;
        context.beginPath();
        
        if (particle.type === 'cyber') {
          context.rect(particle.x - particle.size/2, particle.y - particle.size/2, Math.max(0, particle.size), Math.max(0, particle.size));
        } else if (particle.type === 'fire') {
          context.arc(particle.x, particle.y, Math.max(0.1, particle.size * particle.life), 0, Math.PI * 2);
        } else {
          context.arc(particle.x, particle.y, Math.max(0.1, particle.size), 0, Math.PI * 2);
        }
        
        context.fill();
        context.restore();
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  function showToast(icon, message) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, icon, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast((value) => ({ ...value, show: false }));
    }, 3000);
  }

  function showModal(icon, title, text) {
    setModal({ show: true, icon, title, text });
  }

  function closeModal() {
    setModal((value) => ({ ...value, show: false }));
  }

  function createExplosion(x, y, count = 15, color = null, type = 'circle', intensity = 0) {
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const baseSpeed = Math.random() * 8 + 2;
      const speed = baseSpeed + (intensity * 10); // More intensity = faster
      
      let speedX = Math.cos(angle) * speed;
      let speedY = Math.sin(angle) * speed;
      let gravity = 0.3;
      
      if (type === 'fire') {
        speedX = (Math.random() - 0.5) * (6 + intensity * 8);
        speedY = (Math.random() - 1) * (12 + intensity * 15); // Go upwards
        gravity = -0.2 - (intensity * 0.2); // Fly up faster
      } else if (type === 'cyber') {
        speedX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 4);
        speedY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 4);
        gravity = 0; // Linear movement for cyber look
      }

      particlesRef.current.push({
        x,
        y,
        size: type === 'fire' ? Math.random() * (12 + intensity*10) + 8 : Math.random() * 6 + 4,
        speedX,
        speedY,
        gravity,
        life: 1,
        decay: type === 'fire' ? Math.random() * 0.04 + 0.015 : Math.random() * 0.03 + 0.02,
        color: color || (Math.random() > 0.3 ? '#00ff88' : '#00d4ff'),
        type
      });
    }
  }

  function showFloatingNumber(x, y, amount, critical, intensity = 0) {
    const id = `${Date.now()}-${Math.random()}`;
    const angle = Math.random() * Math.PI * 2;
    // Base distance + chaos from intensity
    const distance = 40 + Math.random() * 60 + (intensity * 100);
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance - 100 - (intensity * 50);

    setFloaters((current) => [
      ...current,
      {
        id,
        startX: x,
        startY: y,
        endX,
        endY,
        amount,
        critical,
        intensity,
        rotation: (Math.random() - 0.5) * 60
      },
    ]);

    window.setTimeout(() => {
      setFloaters((current) => current.filter((item) => item.id !== id));
    }, 800);
  }

  function saveLocalState() {
    window.localStorage.setItem(
      'cybertap_v2',
      JSON.stringify({
        points: pointsRef.current,
        totalPoints: totalPointsRef.current,
        energy: energyRef.current,
        upgrades: upgradeLevelsRef.current,
        todayTaps: todayTapsRef.current,
        todayUpgrades: todayUpgradesRef.current,
        todayCollections: todayCollectionsRef.current,
        wheelSpunToday: wheelSpunTodayRef.current,
        dailyClaimed: dailyClaimedRef.current,
        lastSaved: Date.now(),
      })
    );
  }

  function stopTapping() {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    comboCountRef.current = 0;
    setTapStatusText('TAP TO HACK');

    // Reset DOM elements
    const outerGlow = document.getElementById('tap-core-glow');
    const innerBg = document.getElementById('tap-core-inner');
    const tapIcon = document.getElementById('tap-core-icon');
    const tapButton = document.getElementById('tap-button');
    
    if (outerGlow) outerGlow.style.boxShadow = '';
    if (innerBg) innerBg.style.background = '';
    if (tapIcon) {
       tapIcon.style.color = '';
       tapIcon.style.textShadow = '';
    }
    if (tapButton) tapButton.style.transform = '';
    document.body.style.transform = '';
    document.body.style.backgroundColor = '';
  }

  function performTap(target) {
    if (energyRef.current <= 0) {
      stopTapping();
      showToast('⚡', 'No energy! Wait for recharge...');
      return;
    }

    let tapPoints = tapValueRef.current;
    let critical = false;

    if (Math.random() * 100 < criticalChanceRef.current) {
      tapPoints *= Math.floor(Math.random() * 4) + 2;
      critical = true;
    }

    if (boostActiveRef.current && boostExpiresRef.current && Date.now() < boostExpiresRef.current) {
      tapPoints *= boostMultiplierRef.current;
    } else if (boostActiveRef.current) {
      boostActiveRef.current = false;
      setBoostActive(false);
    }

    tapPoints = Math.floor(tapPoints);

    updateRefState(setPoints, pointsRef, (value) => value + tapPoints);
    updateRefState(setTotalPoints, totalPointsRef, (value) => value + tapPoints);
    updateRefState(setEnergy, energyRef, (value) => Math.max(0, value - 1));
    updateRefState(setTodayTaps, todayTapsRef, (value) => value + 1);
    pendingTapsRef.current += 1;

    if (navigator.vibrate) {
      navigator.vibrate(critical ? [30, 20, 30] : 8);
    }

    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    showFloatingNumber(x, y, tapPoints, critical);
    
    const currentCombo = comboCountRef.current;
    const isCombo = currentCombo > 4;
    // Max intensity reached around 50 ticks (4 seconds)
    const rawIntensity = Math.min(1, currentCombo / 50);
    const smoothIntensity = Math.pow(rawIntensity, 2);

    showFloatingNumber(x, y, tapPoints, critical, smoothIntensity);

    const outerGlow = document.getElementById('tap-core-glow');
    const innerBg = document.getElementById('tap-core-inner');
    const tapIcon = document.getElementById('tap-core-icon');

    if (isCombo) {
      setTapStatusText('FIRE MODE 🔥');

      if (outerGlow && innerBg && tapIcon) {
        const r = Math.floor(255);
        const g = Math.floor(100 * (1 - smoothIntensity)); 
        const b = Math.floor(255 * (1 - smoothIntensity)); 
        
        outerGlow.style.boxShadow = `0 0 ${60 + 120*smoothIntensity}px ${10 + 50*smoothIntensity}px rgba(255, ${60 * (1-smoothIntensity)}, 0, ${0.7 + 0.3*smoothIntensity}), inset 0 0 20px rgba(255, 100, 100, 0.5)`;
        
        // Transition gradient from blue to bright red/orange
        innerBg.style.background = `linear-gradient(135deg, rgba(255, ${100*(1-smoothIntensity)}, 0, 1), rgba(${r}, ${g}, ${b}, 1))`;
        
        // Icon color transition
        tapIcon.style.color = `rgb(255, ${255 * (1-smoothIntensity)}, ${255 * (1-smoothIntensity)})`;
        tapIcon.style.textShadow = `0 0 ${20 + 40*smoothIntensity}px rgba(255, 0, 0, 1)`;
        
        // Add a shake effect if high intensity
        if (smoothIntensity > 0.8) {
           target.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px) scale(0.95)`;
           document.body.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
           if (Math.random() > 0.5) {
              document.body.style.backgroundColor = `rgba(255, 0, 0, ${0.2 * smoothIntensity})`;
           } else {
              document.body.style.backgroundColor = '';
           }
        } else if (smoothIntensity > 0.3) {
           target.style.transform = `translate(${(Math.random() - 0.5) * (15 * smoothIntensity)}px, ${(Math.random() - 0.5) * (15 * smoothIntensity)}px) scale(0.95)`;
           document.body.style.transform = '';
           document.body.style.backgroundColor = '';
        }
      }

      const particleCount = Math.floor(8 + 25 * smoothIntensity);
      createExplosion(x, y + 20, critical ? particleCount + 10 : particleCount, critical ? '#ff4500' : '#ff0000', 'fire', smoothIntensity);
      createExplosion(x, y + 20, Math.floor(3 + 10 * smoothIntensity), '#ffaa00', 'fire', smoothIntensity); 
    } else {
      createExplosion(x, y, critical ? 20 : 12, critical ? '#fbbf24' : '#00ffff', 'cyber');
      
      // Reset DOM if tapped manually
      if (outerGlow) outerGlow.style.boxShadow = '';
      if (innerBg) innerBg.style.background = '';
      if (tapIcon) {
         tapIcon.style.color = '';
         tapIcon.style.textShadow = '';
      }
      target.style.transform = '';
      document.body.style.transform = '';
      document.body.style.backgroundColor = '';
    }

    if (critical) {
      setTapCritical(true);
      window.setTimeout(() => setTapCritical(false), 300);
    }
  }

  function startTapping(event) {
    event.preventDefault();

    if (energyRef.current <= 0) {
      showToast('⚡', 'No energy! Wait for recharge...');
      return;
    }

    stopTapping();
    comboCountRef.current = 0;
    setTapStatusText('HACKING... ⚡');
    const target = event.currentTarget;
    performTap(target);

    holdIntervalRef.current = window.setInterval(() => {
      if (energyRef.current <= 0) {
        stopTapping();
        return;
      }

      comboCountRef.current += 1;
      performTap(target);
    }, 80);
  }

  async function loadLeaderboard() {
    setLeaderboardLoading(true);
    try {
      const response = await api.getLeaderboard(20);
      setLeaderboard(response.ok && Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Leaderboard error:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  }

  function switchTab(section) {
    setActiveTab(section);
    if (section === 'top') loadLeaderboard();
  }

  function switchShopCategory(category) {
    setCurrentShopCategory(category);
  }

  function switchLeaderboardType(type) {
    setCurrentLeaderboardType(type);
    loadLeaderboard();
  }

  function switchMissionType(type) {
    setCurrentMissionType(type);
  }

  async function buyUpgrade(upgradeId) {
    const upgrade = Object.values(UPGRADES_CONFIG).flat().find((item) => item.id === upgradeId);
    if (!upgrade) return;

    const level = Number(upgradeLevels[upgradeId]) || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, level));

    if (pointsRef.current < cost) {
      showToast('⚠️', 'Not enough points!');
      return;
    }

    if (level >= upgrade.maxLevel) {
      showToast('✅', 'Maximum level reached!');
      return;
    }

    try {
      const response = await api.upgrade(telegramId, upgradeId);
      if (!response.ok || !response.data?.success) {
        showToast('⚠️', response.error || 'Upgrade failed');
        return;
      }

      const data = response.data;

      setPoints(Number(data.points) || pointsRef.current);
      pointsRef.current = Number(data.points) || pointsRef.current;
      setPointsPerHour(Number(data.points_per_hour) || pointsPerHourRef.current);
      pointsPerHourRef.current = Number(data.points_per_hour) || pointsPerHourRef.current;
      updateRefState(setUpgradeLevels, upgradeLevelsRef, (value) => ({ ...value, [upgradeId]: (value[upgradeId] || 0) + 1 }));
      updateRefState(setTodayUpgrades, todayUpgradesRef, (value) => value + 1);

      switch (upgradeId) {
        case 'multi_tap':
          updateRefState(setTapValue, tapValueRef, (value) => value + 1);
          break;
        case 'energy_max':
          updateRefState(setMaxEnergy, maxEnergyRef, (value) => value + 500);
          updateRefState(setEnergy, energyRef, (value) => Math.min(value + 500, maxEnergyRef.current));
          break;
        case 'energy_regen':
          updateRefState(setEnergyRegen, energyRegenRef, (value) => value + 1);
          break;
        case 'critical_tap':
          updateRefState(setCriticalChance, criticalChanceRef, (value) => value + 5);
          break;
        default:
          break;
      }

      setLevelPopup('LEVEL UP!');
      if (levelPopupTimerRef.current) clearTimeout(levelPopupTimerRef.current);
      levelPopupTimerRef.current = window.setTimeout(() => setLevelPopup(''), 1500);

      createExplosion(window.innerWidth / 2, window.innerHeight / 2, 40, '#fbbf24');
      showToast('✨', `${upgrade.name} upgraded to level ${(upgradeLevels[upgradeId] || 0) + 1}!`);
      saveLocalState();
    } catch (error) {
      console.error('Upgrade error:', error);
      showToast('⚠️', 'Connection error');
    }
  }

  async function claimDailyReward() {
    try {
      const response = await api.daily(telegramId);
      const data = response.data || {};

      if (response.ok && (data.reward || data.points)) {
        setPoints(Number(data.points) || pointsRef.current);
        pointsRef.current = Number(data.points) || pointsRef.current;
        setStreak(Number(data.streak) || streakRef.current);
        streakRef.current = Number(data.streak) || streakRef.current;
        setDailyClaimed(true);
        dailyClaimedRef.current = true;
        setModal({
          show: true,
          icon: '🎁',
          title: 'Daily Reward!',
          text: `You received ${formatNumber(data.reward)} points!\n\nStreak: ${streakRef.current} days`,
        });
        createExplosion(window.innerWidth / 2, window.innerHeight / 3, 60, '#00ff88');
        saveLocalState();
      } else if (data.time_left) {
        const hours = Math.floor(data.time_left / 3600000);
        const minutes = Math.floor((data.time_left % 3600000) / 60000);
        showToast('⏳', `Come back in ${hours}h ${minutes}m`);
      } else if (!response.ok) {
        showToast('⚠️', response.error || 'Daily reward failed');
      }
    } catch (error) {
      console.error('Daily reward error:', error);
      showToast('⚠️', 'Connection error');
    }
  }

  function spinWheel() {
    if (wheelSpinning) return;

    if (wheelSpunTodayRef.current) {
      showToast('🎡', 'Already spun today! Come back tomorrow');
      return;
    }

    setWheelSpinning(true);

    const randomIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const selected = WHEEL_SEGMENTS[randomIndex];
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = 360 * 8 + randomIndex * segmentAngle + segmentAngle / 2;
    setWheelRotation(targetAngle);

    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => {
      setWheelSpinning(false);
      setWheelSpunToday(true);
      wheelSpunTodayRef.current = true;

      let message = '';
      let icon = '🎡';

      if (selected.points > 0) {
        updateRefState(setPoints, pointsRef, (value) => value + selected.points);
        updateRefState(setTotalPoints, totalPointsRef, (value) => value + selected.points);
        message = `You won ${formatNumber(selected.points)} points!`;
        icon = '💰';
        createExplosion(window.innerWidth / 2, window.innerHeight / 2, 40, '#fbbf24');
          refreshWalletRevenueState();
      } else if (selected.special === 'energy_full') {
        updateRefState(setEnergy, energyRef, () => maxEnergyRef.current);
        message = 'Full Energy Refill!';
        icon = '⚡';
      } else if (selected.special === 'boost_2x') {
        const expires = Date.now() + 3600000;
        setBoostActive(true);
        setBoostMultiplier(2);
        setBoostExpires(expires);
        boostActiveRef.current = true;
        boostMultiplierRef.current = 2;
        boostExpiresRef.current = expires;
        message = '2x Boost activated for 1 hour!';
        icon = '🛰️';
      } else if (selected.special === 'jackpot') {
        updateRefState(setPoints, pointsRef, (value) => value + 50000);
        updateRefState(setTotalPoints, totalPointsRef, (value) => value + 50000);
        message = 'JACKPOT! You won 50,000 points!';
        icon = '🎉';
        createExplosion(window.innerWidth / 2, window.innerHeight / 2, 100, '#ffd700');
          refreshWalletRevenueState();
      }

      setModal({ show: true, icon, title: 'Wheel Result!', text: message });
      saveLocalState();

      api.wheelSpin(telegramId, selected.label, selected.points, selected.special).catch(() => {});
    }, 4500);
  }

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      showToast('✅', 'Link copied!');
      setCopyLabel('Copied!');
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopyLabel('Copy Link'), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      showToast('⚠️', 'Copy failed');
    }
  }

  async function prepareWalletLinkChallenge() {
    if (!telegramId) return null;

    const challengeResponse = await api.walletChallenge(telegramId);
    if (!challengeResponse.ok) {
      showToast('⚠️', challengeResponse.error || 'Could not create wallet challenge');
      return null;
    }

    const challengeData = challengeResponse.data || {};
    setWalletLinkChallenge(challengeData.message || '');
    setWalletLinkChallengeExpiresAt(Number(challengeData.expires_at) || 0);
    setWalletManualMode(true);
    return challengeData;
  }

  async function verifyWalletLinkSubmission(address, signature) {
    const verifyResponse = await api.walletVerify(telegramId, address, signature);
    if (!verifyResponse.ok) {
      showToast('⚠️', verifyResponse.error || 'Wallet verification failed');
      return false;
    }

    const verifiedData = verifyResponse.data || {};
    setWalletAddress(verifiedData.wallet_address || address);
    setWalletVerifiedAt(Number(verifiedData.wallet_verified_at) || Date.now());
    setRevenueEarnedLamports(Number(verifiedData.revenue_earned_lamports) || revenueEarnedLamports);
    setRevenueClaimedLamports(Number(verifiedData.revenue_claimed_lamports) || revenueClaimedLamports);
    setWalletClaimCount(Number(verifiedData.wallet_claim_count) || 0);
    setWalletLastClaimAmountLamports(Number(verifiedData.wallet_last_claim_amount_lamports) || 0);
    setRevenueLastClaimSignature(verifiedData.revenue_last_claim_signature || '');
    setWalletManualSignature('');
    showToast('✅', 'Wallet linked to Telegram account');
    return true;
  }

  async function refreshWalletRevenueState() {
    if (!telegramId || (!walletAddress && !walletVerifiedAt)) return;

    try {
      const response = await api.walletStatus(telegramId);
      if (!response.ok || !response.data) return;

      const data = response.data;
      setRevenueEarnedLamports(Number(data.revenue_earned_lamports) || 0);
      setRevenueClaimedLamports(Number(data.revenue_claimed_lamports) || 0);
      setWalletClaimCount(Number(data.wallet_claim_count) || 0);
      setWalletLastClaimAmountLamports(Number(data.wallet_last_claim_amount_lamports) || 0);
      setRevenueLastClaimSignature(data.revenue_last_claim_signature || '');
      return data;
    } catch (error) {
      console.error('Wallet status refresh error:', error);
    }

    return null;
  }

  async function connectSolanaWallet() {
    const provider = window.solana;
    if (!provider?.isPhantom && !provider?.isSolflare) {
      setWalletManualMode(true);
      await prepareWalletLinkChallenge();
      showToast('ℹ️', 'No browser wallet detected. Paste your address and signature below.');
      return null;
    }

    const response = await provider.connect();
    const address = response?.publicKey?.toString?.() || provider.publicKey?.toString?.();
    if (address) setWalletAddress(address);
    return address;
  }

  async function linkSolanaWallet() {
    if (!telegramId) return;

    const provider = window.solana;
    setWalletLinking(true);
    try {
      const challengeData = walletLinkChallenge ? { message: walletLinkChallenge } : await prepareWalletLinkChallenge();
      const message = challengeData?.message;
      if (!message) {
        showToast('⚠️', 'Challenge message is missing');
        return;
      }

      if (provider?.signMessage && (provider.isPhantom || provider.isSolflare)) {
        const address = await connectSolanaWallet();
        if (!address) return;

        const encodedMessage = new TextEncoder().encode(message);
        const signed = await provider.signMessage(encodedMessage, 'utf8');
        const signature = Array.from(signed.signature || signed);
        await verifyWalletLinkSubmission(address, signature);
        return;
      }

      const address = walletManualAddress.trim();
      const signature = walletManualSignature.trim();
      if (!address || !signature) {
        setWalletManualMode(true);
        showToast('⚠️', 'Paste your wallet address and signature first.');
        return;
      }

      await verifyWalletLinkSubmission(address, signature);
    } catch (error) {
      console.error('Wallet link error:', error);
      showToast('⚠️', 'Wallet linking failed');
    } finally {
      setWalletLinking(false);
    }
  }

  async function claimOnchainRevenue() {
    if (!telegramId) return;

    setWalletClaiming(true);
    try {
      const status = await refreshWalletRevenueState();
      const claimableNow = Math.max(
        0,
        Number(status?.revenue_earned_lamports ?? revenueEarnedLamports) - Number(status?.revenue_claimed_lamports ?? revenueClaimedLamports)
      );

      if (claimableNow <= 0) {
        showToast('⚠️', 'No claimable revenue yet. Tap more or wait for the wallet to sync.');
        return;
      }

      const response = await api.walletClaim(telegramId);
      if (!response.ok) {
        showToast('⚠️', response.error || 'Claim failed');
        return;
      }

      const data = response.data || {};
      setRevenueEarnedLamports(Number(data.revenue_earned_lamports) || revenueEarnedLamports);
      setRevenueClaimedLamports(Number(data.revenue_claimed_lamports) || revenueClaimedLamports);
      setWalletClaimCount(Number(data.wallet_claim_count) || walletClaimCount);
      setWalletLastClaimAmountLamports(Number(data.wallet_last_claim_amount_lamports) || walletLastClaimAmountLamports);
      setRevenueLastClaimSignature(data.revenue_last_claim_signature || data.signature || '');
      showToast('✅', `Claimed ${formatSol(data.claimed_lamports || 0)}`);
    } catch (error) {
      console.error('Revenue claim error:', error);
      showToast('⚠️', 'Revenue claim failed');
    } finally {
      setWalletClaiming(false);
    }
  }

  function loadUserDataAndBootstrap() {
    let cancelled = false;

    const loadLocalState = () => {
      const saved = window.localStorage.getItem('cybertap_v2');
      if (!saved) return;

      try {
        const data = JSON.parse(saved);
        const lastSaved = Number(data.lastSaved) || 0;
        const isNewDay = new Date(lastSaved).toDateString() !== new Date().toDateString();

        if (isNewDay) {
          todayTapsRef.current = 0;
          todayUpgradesRef.current = 0;
          todayCollectionsRef.current = 0;
          wheelSpunTodayRef.current = false;
          dailyClaimedRef.current = false;
          setTodayTaps(0);
          setTodayUpgrades(0);
          setTodayCollections(0);
          setWheelSpunToday(false);
          setDailyClaimed(false);
        } else {
          const nextTodayTaps = Number(data.todayTaps) || 0;
          const nextTodayUpgrades = Number(data.todayUpgrades) || 0;
          const nextTodayCollections = Number(data.todayCollections) || 0;
          const nextWheelSpunToday = Boolean(data.wheelSpunToday);
          const nextDailyClaimed = Boolean(data.dailyClaimed);

          todayTapsRef.current = nextTodayTaps;
          todayUpgradesRef.current = nextTodayUpgrades;
          todayCollectionsRef.current = nextTodayCollections;
          wheelSpunTodayRef.current = nextWheelSpunToday;
          dailyClaimedRef.current = nextDailyClaimed;
          setTodayTaps(nextTodayTaps);
          setTodayUpgrades(nextTodayUpgrades);
          setTodayCollections(nextTodayCollections);
          setWheelSpunToday(nextWheelSpunToday);
          setDailyClaimed(nextDailyClaimed);
        }

        const savedUpgrades = data.upgrades && typeof data.upgrades === 'object' ? data.upgrades : {};
        upgradeLevelsRef.current = savedUpgrades;
        setUpgradeLevels(savedUpgrades);
      } catch (error) {
        console.error('Error loading local state:', error);
      }
    };

    const loadBotInfo = async () => {
      try {
        const response = await api.getBotInfo();
        const data = response.ok ? response.data : null;
        setReferralLink(buildReferralLink(data?.username || botName, telegramId));
      } catch (error) {
        setReferralLink(buildReferralLink(botName, telegramId));
        console.error('Bot info error:', error);
      }
    };

    const loadUserData = async () => {
      try {
        const response = await api.getUser(telegramId);
        if (!response.ok) throw new Error(response.error || 'Server error');
        const data = response.data;

        const nextPoints = Number(data.points) || 0;
        const nextTotalPoints = Number(data.total_points) || nextPoints;
        const nextPointsPerHour = Number(data.points_per_hour) || 0;
        const nextStreak = Number(data.streak) || 0;
        const nextReferralCount = Number(data.referral_count) || 0;
        const nextTapValue = Number(data.tap_value) || 1;
        const nextCriticalChance = Number(data.critical_chance) || 0;
        const nextMaxEnergy = Number(data.max_energy) || 1000;
        const nextEnergyRegen = Number(data.energy_regen) || 1;
        const nextWalletAddress = data.wallet_address || '';
        const nextWalletVerifiedAt = Number(data.wallet_verified_at) || 0;
        const nextRevenueEarnedLamports = Number(data.revenue_earned_lamports) || 0;
        const nextRevenueClaimedLamports = Number(data.revenue_claimed_lamports) || 0;
        const nextWalletClaimCount = Number(data.wallet_claim_count) || 0;
        const nextWalletLastClaimAmountLamports = Number(data.wallet_last_claim_amount_lamports) || 0;
        const nextRevenueLastClaimSignature = data.revenue_last_claim_signature || '';
        const nextUpgrades = {};

        if (Array.isArray(data.upgrades)) {
          data.upgrades.forEach((upgrade) => {
            nextUpgrades[upgrade.id || upgrade.upgrade_id] = Number(upgrade.level) || 0;
          });
        }

        setPoints(nextPoints);
        setTotalPoints(nextTotalPoints);
        setPointsPerHour(nextPointsPerHour);
        setStreak(nextStreak);
        setReferralCount(nextReferralCount);
        setTapValue(nextTapValue);
        setCriticalChance(nextCriticalChance);
        setMaxEnergy(nextMaxEnergy);
        setEnergyRegen(nextEnergyRegen);
        setWalletAddress(nextWalletAddress);
        setWalletVerifiedAt(nextWalletVerifiedAt);
        setRevenueEarnedLamports(nextRevenueEarnedLamports);
        setRevenueClaimedLamports(nextRevenueClaimedLamports);
        setWalletClaimCount(nextWalletClaimCount);
        setWalletLastClaimAmountLamports(nextWalletLastClaimAmountLamports);
        setRevenueLastClaimSignature(nextRevenueLastClaimSignature);
        setUpgradeLevels(nextUpgrades);

        pointsRef.current = nextPoints;
        totalPointsRef.current = nextTotalPoints;
        pointsPerHourRef.current = nextPointsPerHour;
        streakRef.current = nextStreak;
        referralCountRef.current = nextReferralCount;
        tapValueRef.current = nextTapValue;
        criticalChanceRef.current = nextCriticalChance;
        maxEnergyRef.current = nextMaxEnergy;
        energyRegenRef.current = nextEnergyRegen;
        upgradeLevelsRef.current = nextUpgrades;

        const offline = Number(data.offline_earnings) || 0;
        setOfflineEarnings(offline);

        if (offlineCollectTimerRef.current) clearTimeout(offlineCollectTimerRef.current);

        if (offline > 0) {
          setOfflineVisible(true);
          offlineCollectTimerRef.current = window.setTimeout(async () => {
            try {
              await api.collect(telegramId);
            } catch (error) {
              console.error('Collect error:', error);
            }

            updateRefState(setPoints, pointsRef, (value) => value + offline);
            updateRefState(setTodayCollections, todayCollectionsRef, (value) => value + 1);
            setOfflineVisible(false);
            saveLocalState();
          }, 3000);
        } else {
          setOfflineVisible(false);
        }

        const rankResponse = await api.getRank(telegramId);
        if (rankResponse.ok) {
          const nextRank = Number(rankResponse.data?.rank) || null;
          setUserRank(nextRank ? `#${nextRank}` : '#--');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        showToast('⚠️', 'Connection error - offline mode');
      }
    };

    const sendPendingTaps = async () => {
      if (pendingTapsRef.current <= 0) return;

      const tapsToSend = pendingTapsRef.current;
      pendingTapsRef.current = 0;

      try {
        const response = await api.tap(telegramId, tapsToSend, tapValueRef.current);
        const data = response.data || {};
        if (response.ok && data.points !== undefined) {
          const nextPoints = Math.max(pointsRef.current, Number(data.points) || 0);
          pointsRef.current = nextPoints;
          setPoints(nextPoints);
          refreshWalletRevenueState();
        }
      } catch (error) {
        pendingTapsRef.current += tapsToSend;
        console.error('Tap error:', error);
      }
    };

    setIsBootstrapping(true);

    (async () => {
      loadLocalState();
      await Promise.allSettled([loadUserData(), loadBotInfo()]);

      if (cancelled) return;

      passiveTimerRef.current = window.setInterval(() => {
        if (pointsPerHourRef.current > 0) {
          updateRefState(setPoints, pointsRef, (value) => value + pointsPerHourRef.current / 3600);
          updateRefState(setTotalPoints, totalPointsRef, (value) => value + pointsPerHourRef.current / 3600);
        }

        if (energyRef.current < maxEnergyRef.current) {
          updateRefState(setEnergy, energyRef, (value) => Math.min(maxEnergyRef.current, value + energyRegenRef.current));
        }
      }, 1000);

      tapSyncTimerRef.current = window.setInterval(sendPendingTaps, 2000);
      saveTimerRef.current = window.setInterval(saveLocalState, 10000);
      setIsBootstrapping(false);
    })();

    return () => {
      cancelled = true;
      if (passiveTimerRef.current) clearInterval(passiveTimerRef.current);
      if (tapSyncTimerRef.current) clearInterval(tapSyncTimerRef.current);
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      if (offlineCollectTimerRef.current) clearTimeout(offlineCollectTimerRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }

  useEffect(() => {
    if (!telegramId) return undefined;

    const cleanup = loadUserDataAndBootstrap();

    return () => {
      if (typeof cleanup === 'function') cleanup();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (levelPopupTimerRef.current) clearTimeout(levelPopupTimerRef.current);
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [telegramId]);

  const currentLeague = getLeague(totalPoints);
  const currentUpgrades = UPGRADES_CONFIG[currentShopCategory] || [];
  const currentMissions = currentMissionType === 'daily' ? DAILY_MISSIONS : WEEKLY_MISSIONS;
  const userRankLeague = getLeague(totalPoints);
  const userRankPoints = `${formatNumber(points)} pts`;
  const claimDailyButtonLabel = isBootstrapping ? 'Loading...' : dailyClaimed ? 'Claimed!' : 'Claim Reward';
  const spinButtonLabel = isBootstrapping ? 'Loading...' : wheelSpinning ? 'Spinning...' : wheelSpunToday ? 'Spun Today!' : 'Spin the Wheel';

  return (
    <div className="app bg-background text-on-background font-body-md min-h-screen circuit-bg">
      <div className="bg-animation" />
      <div className="matrix-bg" />
      <canvas id="particle-canvas" ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />

      {floaters.map((item) => (
        <div
          key={item.id}
          className={`fixed pointer-events-none z-[100] font-black drop-shadow-[0_4px_4px_rgba(0,0,0,1)] ${item.critical || item.intensity > 0.5 ? 'text-tertiary scale-150 z-[101]' : 'text-primary-container scale-110'}`}
          style={{ 
             left: `${item.startX}px`, 
             top: `${item.startY}px`,
             textShadow: item.critical || item.intensity > 0.5 ? '0 0 10px #ff0000, 0 0 20px #ffaa00' : '0 0 10px #0055ff, 0 0 20px #00ffff',
             animation: `explode-out 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
             '--end-x': `${item.endX}px`,
             '--end-y': `${item.endY}px`,
             '--rot': `${item.rotation}deg`
          }}
        >
          +{formatNumber(item.amount)}{item.critical ? '!' : ''}
        </div>
      ))}

      {levelPopup ? <div className="level-popup">{levelPopup}</div> : null}

      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-slate-950 border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden bg-surface-container">
            <img alt="User Pilot Avatar" data-alt="close-up 3d render of a futuristic cyber pilot avatar wearing a glowing neon visor and sleek chrome armor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATpbd59qTvWL9C-7-G5pVBJLY45WeToWxg6ljs1cTjVrpREdjx24kynVcjiaWZTarCQqDvn2eIWdCpbkhBsQfxmDy1uoH8ASDpJ-NLcmilmbdHaGUvHPKUn4b_WEUM3IDxUGB7IB0IdRKqKrADfu6xcUc73tNdImgRALFmzbcPmuFJHWIt1nTAkijJulY9pAC2KiTnnayM3wA2Qjj_xA2pI53gDOfePZJCYQLPwhlvfJ636hjaB593zmnlUaLHI5wXIWgJO9uFdH3y"/>
          </div>
          <div className="flex flex-col">
            <h1 className="font-['Plus_Jakarta_Sans'] font-black uppercase tracking-tighter text-xl italic drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-blue-500">{username}</h1>
            <span className={`text-[10px] font-black uppercase tracking-wider ${backendHealth === 'online' ? 'text-primary' : backendHealth === 'degraded' ? 'text-accent' : 'text-danger'}`}>
              API {backendHealth === 'online' ? 'Online' : backendHealth === 'degraded' ? 'Degraded' : backendHealth === 'offline' ? 'Offline' : 'Checking'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border-2 border-black rounded-lg px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="material-symbols-outlined text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          <span className="font-['Plus_Jakarta_Sans'] font-black uppercase tracking-tighter text-blue-500">
            {isBootstrapping ? '...' : formatNumber(points)} PTS
          </span>
        </div>
      </header>

      {offlineVisible ? (
        <div className="offline-banner show" id="offline-banner">
          💰 You earned <span className="offline-amount" id="offline-amount">{formatNumber(offlineEarnings)}</span> points while away!
        </div>
      ) : null}

      <section id="section-game" className={`${activeTab === 'game' ? 'block' : 'hidden'} pt-24 pb-32 px-4 max-w-md mx-auto flex flex-col gap-8 w-full`}>
        {/* Stats Section */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-surface-container border-2 border-black hard-shadow p-3 rounded-xl flex flex-col items-center">
            <span className="text-[10px] font-black text-outline mb-1 uppercase">Gems</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary-fixed text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
              <span className="text-xl font-black text-secondary-fixed">{isBootstrapping ? '...' : formatNumber(points)}</span>
            </div>
          </div>
          <div className="bg-surface-container border-2 border-black hard-shadow p-3 rounded-xl flex flex-col items-center">
            <span className="text-[10px] font-black text-outline mb-1 uppercase">Energy</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span className="text-xl font-black text-primary-container">{isBootstrapping ? '...' : Math.floor(energy)}</span>
            </div>
          </div>
          <div className="bg-surface-container border-2 border-black hard-shadow p-3 rounded-xl flex flex-col items-center">
            <span className="text-[10px] font-black text-outline mb-1 uppercase">Income</span>
            <div className="bg-tertiary-container text-white px-2 py-0.5 rounded border border-black text-[10px] font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {isBootstrapping ? '...' : `+${formatNumber(pointsPerHour)}/h`}
            </div>
          </div>
        </section>

        {/* Central Tapping Mechanic */}
        <section className="relative flex flex-col items-center justify-center py-12">
          {/* Energy Bar Overlay */}
          <div className="absolute -top-4 w-full px-8">
            <div className="h-6 w-full bg-black rounded-full border-2 border-slate-700 overflow-hidden relative">
              <div className="h-full bg-primary-container shadow-[0_0_15px_rgba(0,85,255,0.8)] relative transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, (energy / maxEnergy) * 100))}%` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/4 animate-pulse"></div>
              </div>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md">{Math.floor(energy)} / {maxEnergy} MAX</span>
            </div>
          </div>
          {/* The Tap Core */}
          <button 
            className={`group relative active:scale-95 transition-transform duration-75 ${tapCritical ? 'critical' : ''}`}
            disabled={isBootstrapping}
            onPointerDown={startTapping}
            onPointerUp={stopTapping}
            onPointerLeave={stopTapping}
            onPointerCancel={stopTapping}
            onContextMenu={(event) => event.preventDefault()}
          >
            <div className="absolute inset-0 rounded-full bg-primary-container/20 blur-3xl animate-pulse"></div>
            <div id="tap-core-glow" className="w-64 h-64 rounded-full bg-slate-900 border-[6px] border-black p-4 shadow-[0_12px_0_0_rgba(0,0,0,1)] tap-core-glow overflow-hidden flex items-center justify-center relative transition-all duration-75">
              <div id="tap-core-inner" className="w-full h-full rounded-full bg-gradient-to-br from-primary-container to-blue-900 border-4 border-white/20 flex items-center justify-center relative overflow-hidden transition-colors duration-75">
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,white_10px,white_11px)]"></div>
                <span id="tap-core-icon" className="material-symbols-outlined text-white text-9xl drop-shadow-2xl transition-all duration-75" style={{ fontVariationSettings: "'FILL' 1" }}>
                  ads_click
                </span>
                <div className="absolute inset-0 border-[12px] border-white/10 rounded-full scale-90"></div>
              </div>
            </div>
          </button>
          <div className="mt-8 text-center">
            <p className="text-label-sm font-label-sm text-outline uppercase tracking-widest">+{tapValue} COINS / TAP</p>
          </div>
        </section>

        {/* World Events & Daily Quests */}
        <section className="flex flex-col gap-4">
          <div className="bg-primary-container border-2 border-black rounded-2xl p-4 hard-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <span className="bg-black text-secondary-fixed text-[10px] font-black px-2 py-0.5 rounded-full border border-black">LIVE</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-black/20 p-2 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
              </div>
              <div>
                <h3 className="text-headline-md font-headline-md text-white">NEON STORM</h3>
                <p className="text-body-md font-body-md text-blue-100/80">Multiplier increased to 2x for all taps in the next 14m</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container border-2 border-black rounded-2xl p-4 hard-shadow flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                <span className="text-[10px] font-black text-outline">DAILY</span>
              </div>
              <div>
                <h4 className="text-body-lg font-body-lg text-on-surface">5k Taps</h4>
                <div className="h-2 w-full bg-black rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-tertiary" style={{ width: `${Math.min(100, (todayTaps / 5000) * 100)}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container border-2 border-black rounded-2xl p-4 hard-shadow flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                <span className="text-[10px] font-black text-outline">SOCIAL</span>
              </div>
              <div>
                <h4 className="text-body-lg font-body-lg text-on-surface">Invite 3</h4>
                <div className="h-2 w-full bg-black rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-secondary-fixed" style={{ width: `${Math.min(100, (referralCount / 3) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section id="section-shop" className={`${activeTab === 'shop' ? 'block' : 'hidden'} max-w-md mx-auto px-6 pt-24 pb-32 space-y-8 w-full`}>
        <section className="relative w-full h-48 rounded-[32px] overflow-hidden border-4 border-primary-container hard-shadow">
          <img className="w-full h-full object-cover" alt="promotion" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN---l2L8Z3SPd33BWDKBs8bVHVqfuj0uEcjUCa3PJ-7weicVqTUVagh9un2Evujwn2C_p7JvgMmn1Or_4YoBY71vbIH0NVpkTllLCBUokd5mQsTZuUtQr8LzME5NUPYC944IJxYQpkycvZx2SQXfdyWcgwBaThNfEl4n8r6PX-sOU0Q03HMMamDP2PlEzEvFNi8b2m6LBvic11kd72TftSFNuFzb-5-MSivxRB0EcLIHEQpF-LoGqgw-WpCycDDfytCbm0yK1v4Su" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <span className="bg-error text-on-error w-fit px-3 py-1 rounded-full text-xs font-black mb-2 uppercase italic">Limited Time!</span>
            <h2 className="text-2xl font-black text-white uppercase italic">Mythic Dragon Skin</h2>
            <p className="text-primary font-bold">Only 24 hours left!</p>
          </div>
        </section>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <button className={`${currentShopCategory === 'tap' ? 'bg-[#FFD200] text-slate-900 border-on-primary-container shadow-lg' : 'bg-surface-container-high text-on-surface-variant border-black/20 hover:bg-surface-container-highest'} px-6 py-3 rounded-2xl font-black text-xs flex-shrink-0 border-b-4 transition-colors flex items-center gap-2`} onClick={() => switchShopCategory('tap')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>touch_app</span>
            TAP
          </button>
          <button className={`${currentShopCategory === 'passive' ? 'bg-[#FFD200] text-slate-900 border-on-primary-container shadow-lg' : 'bg-surface-container-high text-on-surface-variant border-black/20 hover:bg-surface-container-highest'} px-6 py-3 rounded-2xl font-black text-xs flex-shrink-0 border-b-4 transition-colors flex items-center gap-2`} onClick={() => switchShopCategory('passive')}>
            <span className="material-symbols-outlined">bolt</span>
            PASSIVE
          </button>
          <button className={`${currentShopCategory === 'special' ? 'bg-[#FFD200] text-slate-900 border-on-primary-container shadow-lg' : 'bg-surface-container-high text-on-surface-variant border-black/20 hover:bg-surface-container-highest'} px-6 py-3 rounded-2xl font-black text-xs flex-shrink-0 border-b-4 transition-colors flex items-center gap-2`} onClick={() => switchShopCategory('special')}>
            <span className="material-symbols-outlined">stars</span>
            SPECIAL
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isBootstrapping ? (
            <div className="col-span-2 text-center text-white">Loading...</div>
          ) : currentUpgrades.map((upgrade) => {
              const level = Number(upgradeLevels[upgrade.id]) || 0;
              const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, level));
              const isMaxed = level >= upgrade.maxLevel;
              const canAfford = points >= cost;
              const locked = !isUpgradeUnlocked(upgrade, referralCount, streak);

              return (
                <div key={upgrade.id} className="bg-surface-container-low border-4 border-surface-container-highest rounded-[24px] p-4 flex flex-col items-center text-center relative hard-shadow">
                  {locked && <div className="absolute inset-0 bg-black/60 rounded-[20px] z-20 flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-white">lock</span></div>}
                  {upgrade.popular && !locked && (
                    <div className="absolute -top-2 -right-2 bg-secondary text-on-secondary px-2 py-1 rounded-lg text-[10px] font-black italic transform rotate-12 z-10 border-2 border-surface-container-highest">
                      POPULAR
                    </div>
                  )}
                  <div className="w-full h-24 bg-surface-container-highest rounded-xl mb-4 flex items-center justify-center relative overflow-hidden text-5xl">
                    {upgrade.icon}
                  </div>
                  <h3 className="font-black text-xs text-on-surface mb-1 uppercase">{upgrade.name}</h3>
                  <p className="text-[10px] text-on-surface-variant mb-4 uppercase h-6 line-clamp-2">{getUpgradeEffectText(upgrade)}</p>
                  
                  <button 
                    disabled={!canAfford || isMaxed || locked}
                    onClick={() => buyUpgrade(upgrade.id)}
                    className={`w-full py-3 rounded-xl font-black text-xs relative overflow-hidden ${isMaxed ? 'bg-slate-700 text-slate-400 border-b-4 border-slate-900 cursor-not-allowed' : canAfford ? 'bg-[#FFD200] text-slate-900 shadow-[0_4px_0_#b29300] active:translate-y-1 active:shadow-none' : 'bg-surface-container-highest text-slate-500 border-b-4 border-slate-900'}`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-1">
                      {isMaxed ? 'MAX LEVEL' : locked ? 'LOCKED' : <>{formatNumber(cost)} <span className="text-[14px]">💎</span></>}
                    </span>
                  </button>
                </div>
              );
          })}
        </div>
      </section>

      <section id="section-top" className={`${activeTab === 'top' ? 'block' : 'hidden'} max-w-md mx-auto px-6 pt-24 pb-32 w-full`}>
        <section className="mt-8 mb-12">
          <h2 className="text-3xl font-black text-center mb-8 text-primary drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">TOP PLAYERS</h2>
          <div className="flex items-end justify-center gap-2 h-64">
            {(() => {
              if (isBootstrapping || leaderboard.length < 3) return <div className="text-white text-center w-full">Loading...</div>;
              const top3 = [...leaderboard]
                .sort((a, b) => (Number(b.total_points || b.points || 0)) - (Number(a.total_points || a.points || 0)))
                .slice(0, 3);
              const p1 = top3[0]; const p2 = top3[1]; const p3 = top3[2];
              return (
                <>
                  {/* Rank 2 (Left) */}
                  {p2 && (
                    <div className="flex flex-col items-center w-1/3">
                      <div className="relative mb-2">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-300 overflow-hidden bg-slate-800 p-1 flex items-center justify-center text-2xl font-black text-slate-300">
                          {p2.first_name?.[0] || 'A'}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-slate-300 text-slate-900 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black">2</div>
                      </div>
                      <div className="w-full bg-slate-400 h-24 rounded-t-2xl border-x-4 border-t-4 border-slate-500 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.3)]">
                        <span className="font-black text-slate-900 truncate w-full text-center px-1 text-xs">{p2.first_name || p2.username || 'Anon'}</span>
                        <span className="text-[10px] font-bold text-slate-800">{formatNumber(p2.total_points || p2.points)}</span>
                      </div>
                    </div>
                  )}
                  {/* Rank 1 (Middle) */}
                  {p1 && (
                    <div className="flex flex-col items-center w-1/3 animate-bounce-slow">
                      <div className="relative mb-2">
                        <div className="w-20 h-20 rounded-full border-4 border-[#FFD200] overflow-hidden bg-slate-900 p-1 shadow-[0_0_20px_rgba(255,210,0,0.4)] flex items-center justify-center text-3xl font-black text-[#FFD200]">
                          {p1.first_name?.[0] || 'A'}
                        </div>
                        <div className="absolute -top-3 -right-2 bg-[#FFD200] text-slate-950 w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-black animate-pulse">1</div>
                      </div>
                      <div className="w-full bg-[#FFD200] h-32 rounded-t-2xl border-x-4 border-t-4 border-[#b29300] relative overflow-hidden flex flex-col items-center justify-center shadow-[0_12px_0_rgba(0,0,0,0.3)]">
                        <span className="font-black text-slate-950 uppercase truncate w-full text-center px-1 text-sm">{p1.first_name || p1.username || 'Anon'}</span>
                        <span className="text-[10px] font-black text-slate-800">{formatNumber(p1.total_points || p1.points)}</span>
                      </div>
                    </div>
                  )}
                  {/* Rank 3 (Right) */}
                  {p3 && (
                    <div className="flex flex-col items-center w-1/3">
                      <div className="relative mb-2">
                        <div className="w-16 h-16 rounded-full border-4 border-orange-700 overflow-hidden bg-orange-950 p-1 flex items-center justify-center text-2xl font-black text-orange-400">
                          {p3.first_name?.[0] || 'A'}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-orange-700 text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black">3</div>
                      </div>
                      <div className="w-full bg-orange-800 h-20 rounded-t-2xl border-x-4 border-t-4 border-orange-950 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.3)]">
                        <span className="font-black text-orange-100 drop-shadow-md truncate w-full text-center px-1 text-xs">{p3.first_name || p3.username || 'Anon'}</span>
                        <span className="text-[10px] font-bold text-orange-200">{formatNumber(p3.total_points || p3.points)}</span>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between px-6 py-2 bg-surface-container-high rounded-xl border-2 border-surface-container-highest">
            <span className="text-xs font-bold text-on-surface-variant">RANK & PLAYER</span>
            <span className="text-xs font-bold text-on-surface-variant">SCORE</span>
          </div>

          {!isBootstrapping && leaderboard.slice(3, 20).map((player, idx) => {
            const index = idx + 3;
            const league = getLeague(Number(player.total_points || player.points) || 0);
            return (
              <div key={index} className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border-b-4 border-slate-950 hover:translate-y-[-2px] transition-transform">
                <span className="font-black text-slate-500 w-8">{index + 1}</span>
                <div className="w-12 h-12 rounded-full border-2 border-slate-700 overflow-hidden flex items-center justify-center bg-slate-800 text-white font-bold">
                  {player.first_name?.[0] || player.username?.[0] || '?'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-black text-white truncate">{player.first_name || player.username || 'Anonymous'}</p>
                  <p className="text-xs text-slate-400">{league.icon} {league.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#FFD200]">{formatNumber(player.points)}</p>
                </div>
              </div>
            );
          })}

          {!isBootstrapping && (
            <div className="flex items-center gap-4 bg-[#6e208c] p-4 rounded-2xl border-b-4 border-[#320046] shadow-[0_0_15px_rgba(110,32,140,0.5)] mt-4">
              <span className="font-black text-secondary w-8">{userRank.replace('#','')}</span>
              <div className="w-12 h-12 rounded-full border-2 border-secondary overflow-hidden bg-slate-900 flex items-center justify-center text-white font-bold">
                {username?.[0] || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-black text-white truncate">YOU</p>
                <p className="text-xs text-secondary">{userRankLeague.icon} {userRankLeague.name}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-[#FFD200]">{userRankPoints}</p>
              </div>
            </div>
          )}
        </section>
      </section>

      <section id="section-daily" className={`${activeTab === 'daily' ? 'block' : 'hidden'} max-w-md mx-auto px-6 pt-24 pb-32 w-full`}>
        <section className="mb-12 flex flex-col items-center">
          <div className="flex gap-4 mb-8 w-full justify-center px-4">
            <div className="flex-1 relative">
              <div className="w-full h-24 bg-primary-container rounded-2xl border-4 border-black hard-shadow flex flex-col items-center justify-center rotate-2">
                <span className="text-black text-[10px] font-black uppercase opacity-80">STREAK</span>
                <span className="text-black text-4xl font-black -mt-1">{streak}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-secondary-fixed text-black px-2 py-0.5 rounded border-2 border-black text-[10px] font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                DAYS
              </div>
            </div>
            <div className="flex-1 relative">
               <div className="w-full h-24 bg-[#FFD200] rounded-2xl border-4 border-black hard-shadow flex flex-col items-center justify-center -rotate-2">
                 <span className="text-black text-[10px] font-black uppercase opacity-80">BONUS</span>
                 <span className="text-black text-4xl font-black -mt-1">{boostActive ? '2X' : '1X'}</span>
               </div>
               <div className="absolute -bottom-2 -right-2 bg-white text-black px-2 py-0.5 rounded border-2 border-black text-[10px] font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                MULTIPLIER
              </div>
            </div>
          </div>

          <div className="relative w-64 h-64 mx-auto mb-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="w-8 h-8 bg-white border-4 border-black rotate-45 hard-shadow flex items-center justify-center"></div>
            </div>
            <div 
              className="w-full h-full rounded-full border-8 border-black overflow-hidden relative hard-shadow bg-slate-900"
              style={{ 
                transform: `rotate(${wheelRotation}deg)`, 
                transitionDuration: wheelSpinning ? '4.5s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.1, 0.7, 0.1, 1)' 
              }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(${WHEEL_SEGMENTS.map((s, i) => `${s.color} ${i * 36}deg ${(i + 1) * 36}deg`).join(', ')})`
                }}
              ></div>
              {WHEEL_SEGMENTS.map((_, i) => (
                <div 
                  key={`line-${i}`}
                  className="absolute top-0 left-1/2 w-[4px] h-1/2 bg-black origin-bottom -translate-x-1/2"
                  style={{ transform: `rotate(${i * 36}deg)` }}
                ></div>
              ))}
              {WHEEL_SEGMENTS.map((segment, index) => {
                const rotation = index * 36 + 18;
                return (
                  <div 
                    key={`label-${index}`}
                    className="absolute inset-0 origin-center pointer-events-none"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <div className="absolute top-[8px] left-1/2 -translate-x-1/2 h-1/2 flex items-start justify-center pt-2">
                      <span 
                        className="block font-black text-black text-[12px] uppercase tracking-tighter shadow-sm" 
                        style={{ 
                           writingMode: 'vertical-rl',
                           textOrientation: 'mixed',
                           textShadow: '1px 1px 0px rgba(255,255,255,0.7)'
                        }}
                      >
                        {segment.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="absolute inset-0 m-auto w-12 h-12 bg-surface-container border-4 border-black rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <span className="text-xl">🎡</span>
              </div>
            </div>
          </div>
          
          <div className="w-full flex gap-4 mt-4">
             <button disabled={isBootstrapping || dailyClaimed} onClick={claimDailyReward} className="flex-1 bg-secondary-fixed text-black font-black py-4 rounded-2xl border-4 border-black hard-shadow active:translate-y-1 active:shadow-none flex items-center justify-center gap-2">
                <span>🎁</span> {claimDailyButtonLabel}
             </button>
             <button disabled={isBootstrapping || wheelSpinning || wheelSpunToday} onClick={spinWheel} className="flex-1 bg-slate-800 text-white font-black py-4 rounded-2xl border-4 border-black hard-shadow active:translate-y-1 active:shadow-none flex items-center justify-center gap-2">
                <span>🎡</span> {spinButtonLabel}
             </button>
          </div>
        </section>

        <section className="relative mt-12">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-3 bg-black/40 rounded-full"></div>
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-primary-container/20"></div>
          
          <div className="flex justify-center mb-8 relative z-10">
            <div className="bg-surface-container-high border-2 border-black rounded-xl p-1 flex">
              <button className={`px-6 py-2 rounded-lg font-black text-sm ${currentMissionType === 'daily' ? 'bg-primary-container text-white border-2 border-black' : 'text-on-surface-variant'}`} onClick={() => switchMissionType('daily')}>Daily</button>
              <button className={`px-6 py-2 rounded-lg font-black text-sm ${currentMissionType === 'weekly' ? 'bg-primary-container text-white border-2 border-black' : 'text-on-surface-variant'}`} onClick={() => switchMissionType('weekly')}>Weekly</button>
            </div>
          </div>

          <div className="space-y-16 relative">
             {currentMissions.map((mission, index) => {
                const progress = getMissionProgress(mission, { todayTaps, todayUpgrades, todayCollections, wheelSpunToday, streak, referralCount });
                const completed = progress >= mission.target;
                
                return (
                  <div key={mission.id} className={`flex items-center justify-center gap-6 ${completed ? 'opacity-50' : ''}`}>
                    <div className="w-1/2 text-right">
                      <h3 className={`text-xl font-black ${completed ? 'text-on-surface' : 'text-white'}`}>{mission.name}</h3>
                      <p className={`text-xs font-bold ${completed ? 'text-secondary-fixed' : 'text-primary'}`}>{completed ? 'COMPLETED' : 'IN PROGRESS'}</p>
                    </div>
                    <div className="z-10 relative">
                      {!completed && <div className="absolute inset-0 bg-primary-container blur-xl opacity-30 animate-pulse"></div>}
                      <div className={`w-16 h-16 border-4 border-black rounded-[2rem] flex items-center justify-center ${completed ? 'bg-slate-800 text-slate-500' : 'bg-primary-container text-white rotate-[-4deg] hard-shadow'}`}>
                        {completed ? <span className="material-symbols-outlined text-4xl">check_circle</span> : <span className="text-3xl">{mission.icon}</span>}
                      </div>
                    </div>
                    <div className="w-1/2">
                      <div className={`p-3 rounded-xl border-2 border-black ${completed ? 'bg-surface-container-low' : 'bg-slate-900 hard-shadow'}`}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary-fixed text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                            <span className="font-bold text-sm text-white">+{formatNumber(mission.reward)}</span>
                          </div>
                          <div className="text-xs text-slate-400">{formatNumber(progress)} / {formatNumber(mission.target)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
             })}
          </div>
        </section>
      </section>

      <section id="section-profile" className={`${activeTab === 'profile' ? 'block' : 'hidden'} max-w-md mx-auto px-6 pt-24 pb-32 space-y-8 w-full`}>
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl border-4 border-black bg-primary-container hard-shadow overflow-hidden flex items-center justify-center">
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-5xl font-black text-white uppercase italic">
                {username?.[0] || 'U'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-secondary-fixed border-2 border-black px-2 py-1 rounded-md hard-shadow">
              <span className="text-black font-bold text-xs uppercase">LVL {Math.floor(Math.log2(Math.max(1, totalPoints/1000)) + 1)}</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{username}</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Elite Tapper Status</p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container border-2 border-black rounded-2xl p-4 hard-shadow flex flex-col justify-between h-32">
            <span className="text-slate-400 text-[10px] font-black uppercase">Total Taps</span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-primary leading-none whitespace-nowrap">{formatNumber(totalPoints)}</span>
              <span className="text-[10px] text-primary/50 font-bold">+{formatNumber(todayTaps)} today</span>
            </div>
          </div>
          <div className="bg-surface-container border-2 border-black rounded-2xl p-4 hard-shadow flex flex-col justify-between h-32">
            <span className="text-slate-400 text-[10px] font-black uppercase">Earnings</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary-fixed text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                <span className="text-2xl font-black text-secondary-fixed leading-none whitespace-nowrap">{(revenueEarnedLamports / 1e9).toFixed(3)} SOL</span>
              </div>
              <span className="text-[10px] text-secondary-fixed/50 font-bold uppercase">SOL Earnt</span>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-primary uppercase italic">Referrals</h2>
          <div className="bg-slate-900 border-2 border-black p-4 rounded-xl hard-shadow flex flex-col gap-4">
            <div className="flex justify-between items-center">
               <span className="font-bold">Friends Invited:</span>
               <span className="font-black text-secondary-fixed text-xl">{referralCount}</span>
            </div>
            <div>
               <p className="text-xs text-slate-400 mb-2">Share your link to earn 5% of their points and special bonuses!</p>
               <div className="flex gap-2">
                 <input type="text" readOnly value={referralLink} className="flex-1 bg-black border-2 border-slate-700 rounded-lg p-2 text-xs text-white" />
                 <button onClick={copyReferralLink} className="bg-primary-container text-white px-4 py-2 rounded-lg font-black text-xs active:scale-95">{copyLabel}</button>
               </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-primary uppercase italic">Web3 Wallet</h2>
          <div className="bg-slate-900 border-2 border-black p-4 rounded-xl hard-shadow flex flex-col gap-4">
             <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-black ${walletLinked ? 'bg-green-500/20 text-green-400' : walletAddress ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {walletStatusLabel}
                </span>
             </div>
             {walletAddress && (
               <div className="text-xs text-slate-400 bg-black p-2 rounded border border-slate-800">
                  {walletAddress}
               </div>
             )}
             
             <div className="grid grid-cols-2 gap-2 text-center text-[10px] mt-2">
                <div className="bg-black p-2 rounded">
                   <div className="text-slate-500 mb-1 uppercase font-black">Claimable</div>
                   <div className="font-black text-primary-container whitespace-nowrap">{(walletClaimableLamports / 1e9).toFixed(4)} SOL</div>
                </div>
                <div className="bg-black p-2 rounded">
                   <div className="text-slate-500 mb-1 uppercase font-black">Claimed</div>
                   <div className="font-black text-white whitespace-nowrap">{(revenueClaimedLamports / 1e9).toFixed(4)} SOL</div>
                </div>
             </div>

             <div className="flex flex-col gap-2 mt-2">
                <button className="w-full bg-slate-800 text-white font-black py-3 rounded-xl border-2 border-black active:scale-95" disabled={walletLinking || walletClaiming} onClick={connectSolanaWallet}>
                  {walletAddress ? 'Reconnect Wallet' : 'Connect Wallet'}
                </button>
                <button className="w-full bg-[#FFD200] text-black font-black py-3 rounded-xl border-2 border-black active:scale-95" disabled={walletLinking || walletClaiming} onClick={linkSolanaWallet}>
                  {walletLinked ? 'Relink Wallet' : 'Sign & Link'}
                </button>
                <button className={`w-full font-black py-3 rounded-xl border-2 border-black active:scale-95 ${walletClaimableLamports > 0 ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`} disabled={walletLinking || walletClaiming || !walletLinked || walletClaimableLamports <= 0} onClick={claimOnchainRevenue}>
                  {walletClaiming ? 'Claiming...' : 'Claim Revenue'}
                </button>
             </div>
          </div>
        </section>
      </section>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-2 pb-6 pt-3 bg-slate-900 border-t-4 border-black shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)] rounded-t-2xl">
        <button className={`flex flex-col items-center justify-center transition-all duration-100 ${activeTab === 'game' ? 'bg-[#CCFF00] text-black border-2 border-black rounded-xl px-4 py-2 scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-8px]' : 'text-slate-500 hover:text-[#CCFF00] p-2'}`} onClick={() => switchTab('game')}>
          <span className="material-symbols-outlined" style={activeTab === 'game' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
          <span className="font-['Plus_Jakarta_Sans'] font-black text-[10px] uppercase mt-1">Home</span>
        </button>
        <button className={`flex flex-col items-center justify-center transition-all duration-100 ${activeTab === 'shop' ? 'bg-[#FFD200] text-black border-2 border-black rounded-xl px-4 py-2 scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-8px]' : 'text-slate-500 hover:text-[#FFD200] p-2'}`} onClick={() => switchTab('shop')}>
          <span className="material-symbols-outlined" style={activeTab === 'shop' ? { fontVariationSettings: "'FILL' 1" } : {}}>shopping_cart</span>
          <span className="font-['Plus_Jakarta_Sans'] font-black text-[10px] uppercase mt-1">Shop</span>
        </button>
        <button className={`flex flex-col items-center justify-center transition-all duration-100 ${activeTab === 'top' ? 'bg-primary-container text-white border-2 border-black rounded-xl px-4 py-2 scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-8px]' : 'text-slate-500 hover:text-primary-container p-2'}`} onClick={() => switchTab('top')}>
          <span className="material-symbols-outlined" style={activeTab === 'top' ? { fontVariationSettings: "'FILL' 1" } : {}}>leaderboard</span>
          <span className="font-['Plus_Jakarta_Sans'] font-black text-[10px] uppercase mt-1">Ranks</span>
        </button>
        <button className={`flex flex-col items-center justify-center transition-all duration-100 ${activeTab === 'daily' ? 'bg-secondary-fixed text-black border-2 border-black rounded-xl px-4 py-2 scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-8px]' : 'text-slate-500 hover:text-secondary-fixed p-2'}`} onClick={() => switchTab('daily')}>
          <span className="material-symbols-outlined" style={activeTab === 'daily' ? { fontVariationSettings: "'FILL' 1" } : {}}>insights</span>
          <span className="font-['Plus_Jakarta_Sans'] font-black text-[10px] uppercase mt-1">Progress</span>
        </button>
        <button className={`flex flex-col items-center justify-center transition-all duration-100 ${activeTab === 'profile' ? 'bg-blue-500 text-white border-2 border-black rounded-xl px-4 py-2 scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-8px]' : 'text-slate-500 hover:text-blue-500 p-2'}`} onClick={() => switchTab('profile')}>
          <span className="material-symbols-outlined" style={activeTab === 'profile' ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
          <span className="font-['Plus_Jakarta_Sans'] font-black text-[10px] uppercase mt-1">Profile</span>
        </button>
      </nav>

      <div className={`toast ${toast.show ? 'show' : ''}`} id="toast">
        <span className="toast-icon" id="toast-icon">{toast.icon}</span>
        <span className="toast-message" id="toast-message">{toast.message}</span>
      </div>

      <div className={`modal-overlay ${modal.show ? 'show' : ''}`} id="modal">
        <div className="modal-content">
          <div className="modal-icon" id="modal-icon">{modal.icon}</div>
          <h3 className="modal-title" id="modal-title">{modal.title}</h3>
          <p className="modal-text" id="modal-text">{modal.text}</p>
          <button className="modal-btn" id="modal-btn" type="button" onClick={closeModal}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default App;
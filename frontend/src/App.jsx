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

function formatNumber(num) {
  const value = Math.floor(Number(num) || 0);
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
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

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(0);
  const particlesRef = useRef([]);
  const pendingTapsRef = useRef(0);
  const holdIntervalRef = useRef(null);
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
        particle.size *= 0.97;

        context.save();
        context.globalAlpha = Math.max(particle.life, 0);
        context.fillStyle = particle.color;
        context.shadowBlur = 15;
        context.shadowColor = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
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

  function createExplosion(x, y, count = 15, color = null) {
    for (let index = 0; index < count; index += 1) {
      particlesRef.current.push({
        x,
        y,
        size: Math.random() * 6 + 2,
        speedX: (Math.random() - 0.5) * 12,
        speedY: (Math.random() - 0.5) * 12 - 5,
        gravity: 0.3,
        life: 1,
        decay: Math.random() * 0.03 + 0.02,
        color: color || (Math.random() > 0.3 ? '#00ff88' : '#fbbf24'),
      });
    }
  }

  function showFloatingNumber(x, y, amount, critical) {
    const id = `${Date.now()}-${Math.random()}`;
    setFloaters((current) => [
      ...current,
      {
        id,
        left: x - 30 + Math.random() * 60 - 30,
        top: y - 50,
        amount,
        critical,
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
    setTapStatusText('TAP TO HACK');
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
    createExplosion(x, y, critical ? 20 : 8, critical ? '#fbbf24' : '#00ff88');

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
    setTapStatusText('HACKING... ⚡');
    performTap(event.currentTarget);

    holdIntervalRef.current = window.setInterval(() => {
      if (energyRef.current <= 0) {
        stopTapping();
        return;
      }

      performTap(event.currentTarget);
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
    <div className="app">
      <div className="bg-animation" />
      <div className="matrix-bg" />
      <canvas id="particle-canvas" ref={canvasRef} />

      {floaters.map((item) => (
        <div
          key={item.id}
          className={`float-text ${item.critical ? 'critical' : ''}`}
          style={{ left: `${item.left}px`, top: `${item.top}px` }}
        >
          +{formatNumber(item.amount)}{item.critical ? ' CRIT!' : ''}
        </div>
      ))}

      {levelPopup ? <div className="level-popup">{levelPopup}</div> : null}

      <header className="header">
        <div className="header-left">
          <span className="username" id="username">{username}</span>
          <span className="version">CyberTap v2.0</span>
          <span className={`version ${backendHealth === 'online' ? 'online' : backendHealth === 'degraded' ? 'degraded' : backendHealth === 'offline' ? 'offline' : ''}`}>
            API {backendHealth === 'online' ? 'Online' : backendHealth === 'degraded' ? 'Degraded' : backendHealth === 'offline' ? 'Offline' : 'Checking'}
          </span>
        </div>
        <div className="league-badge" id="league-badge">
          {isBootstrapping ? (
            <span className="skeleton skeleton-pill skeleton-league" aria-label="Loading league" />
          ) : (
            <>
              <span className="league-icon" id="league-icon">{currentLeague.icon}</span>
              <span className="league-name" id="league-name">{currentLeague.name}</span>
            </>
          )}
        </div>
      </header>

      {offlineVisible ? (
        <div className="offline-banner show" id="offline-banner">
          💰 You earned <span className="offline-amount" id="offline-amount">{formatNumber(offlineEarnings)}</span> points while away!
        </div>
      ) : null}

      <section id="section-game" className={`section ${activeTab === 'game' ? 'active' : ''}`}>
        <div className="main-container">
          <div className="points-section">
            <div className="points-number" id="points-display">
              {isBootstrapping ? <span className="skeleton skeleton-number" aria-label="Loading points" /> : formatNumber(points)}
            </div>
            <div className="points-label">CYBER POINTS</div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="icon">⚡</span>
              <span className="value" id="per-hour-display">
                {isBootstrapping ? <span className="skeleton skeleton-line skeleton-line-sm" aria-label="Loading income" /> : formatNumber(pointsPerHour)}
              </span>
              <span className="label">/ hour</span>
            </div>
            <div className="stat-item">
              <span className="icon">🖱️</span>
              <span className="value" id="tap-power-display">
                {isBootstrapping ? <span className="skeleton skeleton-line skeleton-line-sm" aria-label="Loading tap power" /> : `+${tapValue}`}
              </span>
              <span className="label">/ tap</span>
            </div>
          </div>

          <div className="energy-section">
            <div className="energy-bar-bg">
              {isBootstrapping ? (
                <div className="energy-bar-fill energy-bar-skeleton" aria-label="Loading energy" />
              ) : (
                <div className="energy-bar-fill" id="energy-bar" style={{ width: `${Math.max(0, Math.min(100, (energy / maxEnergy) * 100))}%` }} />
              )}
              <span className="energy-text">
                {isBootstrapping ? <span className="skeleton skeleton-line skeleton-line-lg" aria-label="Loading energy values" /> : <><span id="energy-current">{Math.floor(energy)}</span> / <span id="energy-max">{maxEnergy}</span> ⚡</>}
              </span>
            </div>
          </div>

          <div className="tap-section">
            <button className="lvl-up-btn" type="button" onClick={() => switchTab('shop')}>
              LVL UP <span>»</span>
            </button>

            <div className="tap-rings">
              <div className="ring ring-1" />
              <div className="ring ring-2" />
              <div className="ring ring-3" />
              <div className="progress-arc" id="progress-arc" />

              <button
                className={`tap-button ${tapCritical ? 'critical' : ''}`}
                id="tap-button"
                type="button"
                disabled={isBootstrapping}
                onPointerDown={startTapping}
                onPointerUp={stopTapping}
                onPointerLeave={stopTapping}
                onPointerCancel={stopTapping}
                onContextMenu={(event) => event.preventDefault()}
              >
                {isBootstrapping ? (
                  <>
                    <span className="tap-icon tap-icon-loading">⏳</span>
                    <span className="tap-value tap-value-loading">SYNC</span>
                  </>
                ) : (
                  <>
                    <span className="tap-icon">💥</span>
                    <span className="tap-value" id="tap-value-display">+{tapValue}</span>
                  </>
                )}
              </button>
            </div>

            <div className="tap-status">
              <div className="main-text" id="tap-status-text">{tapStatusText}</div>
              <div className="sub-text">Hold for combo boost ⚡</div>
            </div>
          </div>
        </div>
      </section>

      <section id="section-shop" className={`section ${activeTab === 'shop' ? 'active' : ''}`}>
        <div className="main-container">
          <div className="section-header">
            <span className="section-title">🛒 Upgrades</span>
          </div>

          <div className="shop-tabs">
            <button className={`shop-tab ${currentShopCategory === 'tap' ? 'active' : ''}`} type="button" onClick={() => switchShopCategory('tap')}>
              <span className="shop-tab-icon">🖱️</span>
              <span>Tap</span>
            </button>
            <button className={`shop-tab ${currentShopCategory === 'passive' ? 'active' : ''}`} type="button" onClick={() => switchShopCategory('passive')}>
              <span className="shop-tab-icon">⚡</span>
              <span>Passive</span>
            </button>
            <button className={`shop-tab ${currentShopCategory === 'special' ? 'active' : ''}`} type="button" onClick={() => switchShopCategory('special')}>
              <span className="shop-tab-icon">✨</span>
              <span>Special</span>
            </button>
          </div>

          <div id="upgrades-list">
            {isBootstrapping
              ? Array.from({ length: 4 }, (_, index) => index).map((index) => (
                <article key={`shop-skeleton-${index}`} className="upgrade-card skeleton-card">
                  <div className="upgrade-icon-box skeleton-circle" />
                  <div className="upgrade-info">
                    <div className="skeleton skeleton-line skeleton-line-md" />
                    <div className="skeleton skeleton-line skeleton-line-sm" />
                    <div className="skeleton skeleton-line skeleton-line-xs" />
                  </div>
                  <div className="upgrade-buy-btn skeleton-button" />
                </article>
              ))
              : currentUpgrades.map((upgrade) => {
              const level = Number(upgradeLevels[upgrade.id]) || 0;
              const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, level));
              const isMaxed = level >= upgrade.maxLevel;
              const canAfford = points >= cost;
              const locked = !isUpgradeUnlocked(upgrade, referralCount, streak);

              return (
                <article key={upgrade.id} className={`upgrade-card ${locked ? 'locked' : ''}`}>
                  <div className="upgrade-icon-box">{upgrade.icon}</div>
                  <div className="upgrade-info">
                    <div className="upgrade-name">{upgrade.name}</div>
                    <div className="upgrade-effect">{getUpgradeEffectText(upgrade)}</div>
                    <div className="upgrade-level">
                      Level {level}/{upgrade.maxLevel}
                      {locked ? ` Requires: ${upgrade.requires}` : ''}
                    </div>
                  </div>
                  <button
                    className="upgrade-buy-btn"
                    type="button"
                    disabled={!canAfford || isMaxed || locked}
                    onClick={() => buyUpgrade(upgrade.id)}
                  >
                    <span className="upgrade-cost">{isMaxed ? 'MAX' : locked ? 'LOCKED' : `💰 ${formatNumber(cost)}`}</span>
                    <span className="upgrade-buy-text">{isMaxed ? 'MAX' : locked ? 'Locked' : 'Buy'}</span>
                  </button>
                </article>
              );
              })}
          </div>
        </div>
      </section>

      <section id="section-top" className={`section ${activeTab === 'top' ? 'active' : ''}`}>
        <div className="main-container">
          <div className="section-header">
            <span className="section-title">🏆 Leaderboard</span>
          </div>

          <div className="leaderboard-tabs">
            <button className={`leaderboard-tab ${currentLeaderboardType === 'global' ? 'active' : ''}`} type="button" onClick={() => switchLeaderboardType('global')}>
              🌐 Global
            </button>
            <button className={`leaderboard-tab ${currentLeaderboardType === 'weekly' ? 'active' : ''}`} type="button" onClick={() => switchLeaderboardType('weekly')}>
              📅 Weekly
            </button>
          </div>

          <div id="leaderboard-list">
            {(isBootstrapping || (leaderboardLoading && leaderboard.length === 0)
              ? Array.from({ length: 5 }, (_, index) => ({ id: `leaderboard-skeleton-${index}`, index }))
              : leaderboard.slice(0, 20).map((player, index) => ({ ...player, index })))
              .map((player, index) => {
              if (isBootstrapping || (leaderboardLoading && leaderboard.length === 0)) {
                return (
                  <article key={`leaderboard-skeleton-${index}`} className="leaderboard-item skeleton-card">
                    <span className="lb-rank"><span className="skeleton skeleton-circle skeleton-mini" /></span>
                    <div className="lb-info">
                      <div className="skeleton skeleton-line skeleton-line-md" />
                      <div className="skeleton skeleton-line skeleton-line-sm" />
                    </div>
                    <span className="lb-points"><span className="skeleton skeleton-line skeleton-line-sm" /></span>
                  </article>
                );
              }

              const league = getLeague(Number(player.total_points || player.points) || 0);
              const rankClass = index < 3 ? `top-${index + 1}` : '';
              const rankLabel = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;

              return (
                <article key={`${player.telegram_id || player.username || index}-${index}`} className={`leaderboard-item ${rankClass}`}>
                  <span className="lb-rank">{rankLabel}</span>
                  <div className="lb-info">
                    <div className="lb-name">{player.first_name || player.username || 'Anonymous'}</div>
                    <div className="lb-league">{league.icon} {league.name}</div>
                  </div>
                  <span className="lb-points">{formatNumber(player.points)} pts</span>
                </article>
              );
            })}
          </div>

          <div className="user-rank-card" id="user-rank-card">
            {isBootstrapping ? (
              <>
                <span className="lb-rank"><span className="skeleton skeleton-circle skeleton-mini" /></span>
                <div className="lb-info">
                  <div className="skeleton skeleton-line skeleton-line-md" />
                  <div className="skeleton skeleton-line skeleton-line-sm" />
                </div>
                <span className="lb-points"><span className="skeleton skeleton-line skeleton-line-sm" /></span>
              </>
            ) : (
              <>
                <span className="lb-rank" id="user-rank">{userRank}</span>
                <div className="lb-info">
                  <div className="lb-name" id="user-rank-name">{username}</div>
                  <div className="lb-league" id="user-rank-league">{userRankLeague.icon} {userRankLeague.name}</div>
                </div>
                <span className="lb-points" id="user-rank-points">{userRankPoints}</span>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="section-daily" className={`section ${activeTab === 'daily' ? 'active' : ''}`}>
        <div className="main-container">
          <div className="daily-card">
            <div className="daily-card-header">
              <span className="daily-card-icon">🎁</span>
              <span className="daily-card-title">Daily Reward</span>
            </div>

            <div className="streak-display">
              <span className="streak-label">Current Streak:</span>
              <span className="streak-value" id="streak-count">{isBootstrapping ? <span className="skeleton skeleton-line skeleton-line-sm" aria-label="Loading streak" /> : streak}</span>
              <span className="streak-icon">⚡</span>
            </div>

            <button className="claim-btn" id="claim-daily-btn" type="button" disabled={isBootstrapping || dailyClaimed} onClick={claimDailyReward}>
              <span>🎁</span>
              <span>{claimDailyButtonLabel}</span>
            </button>
          </div>

          <div className="daily-card">
            <div className="daily-card-header">
              <span className="daily-card-icon">🎡</span>
              <span className="daily-card-title">Lucky Wheel</span>
            </div>

            <div className="wheel-container">
              <div className="wheel" id="wheel" style={{ transform: `rotate(${wheelRotation}deg)` }} />
              <div className="wheel-pointer">▼</div>
              <div className="wheel-center">SPIN</div>
            </div>

            <button className="spin-btn" id="spin-btn" type="button" disabled={isBootstrapping || wheelSpinning || wheelSpunToday} onClick={spinWheel}>
              <span>🎡</span>
              <span>{spinButtonLabel}</span>
            </button>
          </div>

          <div className="daily-card">
            <div className="daily-card-header">
              <span className="daily-card-icon">📋</span>
              <span className="daily-card-title">Missions</span>
            </div>

            <div className="mission-tabs">
              <button className={`mission-tab ${currentMissionType === 'daily' ? 'active' : ''}`} type="button" onClick={() => switchMissionType('daily')}>Daily</button>
              <button className={`mission-tab ${currentMissionType === 'weekly' ? 'active' : ''}`} type="button" onClick={() => switchMissionType('weekly')}>Weekly</button>
            </div>

            <div id="missions-list">
              {isBootstrapping
                ? Array.from({ length: 4 }, (_, index) => index).map((index) => (
                  <article key={`mission-skeleton-${index}`} className="mission-card skeleton-card">
                    <div className="mission-icon skeleton-circle" />
                    <div className="mission-info">
                      <div className="skeleton skeleton-line skeleton-line-md" />
                      <div className="skeleton skeleton-line skeleton-line-sm" />
                      <div className="mission-progress"><div className="mission-progress-fill skeleton-progress" /></div>
                      <div className="skeleton skeleton-line skeleton-line-xs" />
                    </div>
                    <div className="mission-reward">
                      <div className="skeleton skeleton-line skeleton-line-sm" />
                      <div className="skeleton skeleton-line skeleton-line-xs" />
                    </div>
                  </article>
                ))
                : currentMissions.map((mission) => {
                const progress = getMissionProgress(mission, { todayTaps, todayUpgrades, todayCollections, wheelSpunToday, streak, referralCount });
                const completed = progress >= mission.target;
                const progressPercent = Math.min((progress / mission.target) * 100, 100);

                return (
                  <article key={mission.id} className={`mission-card ${completed ? 'completed' : ''}`}>
                    <div className="mission-icon">{mission.icon}</div>
                    <div className="mission-info">
                      <div className="mission-name">{mission.name}</div>
                      <div className="mission-desc">{mission.desc}</div>
                      <div className="mission-progress">
                        <div className="mission-progress-fill" style={{ width: `${progressPercent}%` }} />
                      </div>
                      <div style={{ fontSize: '10px', color: '#8892a0', marginTop: '3px' }}>
                        {formatNumber(progress)} / {formatNumber(mission.target)}
                      </div>
                    </div>
                    <div className="mission-reward">
                      <div className="mission-reward-value">{completed ? '✅' : `+${formatNumber(mission.reward)}`}</div>
                      <div className="mission-reward-label">pts</div>
                    </div>
                  </article>
                );
                })}
            </div>
          </div>

          <div className="daily-card">
            <div className="daily-card-header">
              <span className="daily-card-icon">👥</span>
              <span className="daily-card-title">Invite Friends</span>
            </div>

            <div className="referral-stats">
              <div className="referral-stat">
                <div className="referral-stat-value" id="referral-count">{isBootstrapping ? <span className="skeleton skeleton-line skeleton-line-sm" aria-label="Loading referrals" /> : referralCount}</div>
                <div className="referral-stat-label">Friends Invited</div>
              </div>
              <div className="referral-stat">
                <div className="referral-stat-value">+500</div>
                <div className="referral-stat-label">Per Invite</div>
              </div>
              <div className="referral-stat">
                <div className="referral-stat-value">5%</div>
                <div className="referral-stat-label">Earnings</div>
              </div>
            </div>

            <div className="referral-link-box">
              <div className="referral-link-label">Your Referral Link:</div>
              <div className="referral-link" id="referral-link">{isBootstrapping ? <span className="skeleton skeleton-line skeleton-line-lg" aria-label="Loading referral link" /> : referralLink}</div>
              <button className="copy-btn" id="copy-btn" type="button" disabled={isBootstrapping} onClick={copyReferralLink}>
                <span>🔗</span>
                <span>{copyLabel}</span>
              </button>
            </div>

            <div className="milestones-title">🏅 Milestones</div>
            <div id="milestones-list">
              {REFERRAL_MILESTONES.map((milestone) => {
                const achieved = referralCount >= milestone.count;
                return (
                  <article key={milestone.count} className={`milestone-item ${achieved ? 'achieved' : ''}`}>
                    <span className="milestone-icon">{milestone.icon}</span>
                    <div className="milestone-info">
                      <div className="milestone-count">{achieved ? '✅' : '🔒'} {milestone.count} friends</div>
                      <div className="milestone-bonus">{milestone.bonus || 'Points bonus'}</div>
                    </div>
                    <span className="milestone-reward">+{formatNumber(milestone.reward)}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <nav className="bottom-nav">
        <button className={`nav-btn ${activeTab === 'game' ? 'active' : ''}`} data-section="game" type="button" onClick={() => switchTab('game')}>
          <span className="nav-icon">🎮</span>
          <span className="nav-label">Game</span>
        </button>
        <button className={`nav-btn ${activeTab === 'shop' ? 'active' : ''}`} data-section="shop" type="button" onClick={() => switchTab('shop')}>
          <span className="nav-icon">🛍️</span>
          <span className="nav-label">Shop</span>
        </button>
        <button className={`nav-btn ${activeTab === 'top' ? 'active' : ''}`} data-section="top" type="button" onClick={() => switchTab('top')}>
          <span className="nav-icon">🏆</span>
          <span className="nav-label">Top</span>
        </button>
        <button className={`nav-btn ${activeTab === 'daily' ? 'active' : ''}`} data-section="daily" type="button" onClick={() => switchTab('daily')}>
          <span className="nav-icon">🎁</span>
          <span className="nav-label">Daily</span>
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
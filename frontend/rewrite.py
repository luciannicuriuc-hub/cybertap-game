import re

def rewrite():
    file_path = "c:/Users/Costi/Desktop/cybertap-game/frontend/src/App.jsx"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the start of section-shop
    shop_start = content.find('<section id="section-shop"')
    
    # Find the end of the nav
    nav_end = content.find('</nav>') + len('</nav>')
    
    if shop_start == -1 or nav_end == -1:
        print("Could not find boundaries")
        return
        
    replacement = """<section id="section-shop" className={`max-w-md mx-auto px-safe-margin pt-24 pb-32 space-y-8 ${activeTab === 'shop' ? 'block' : 'hidden'}`}>
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

      <section id="section-top" className={`${activeTab === 'top' ? 'block' : 'hidden'} max-w-md mx-auto px-safe-margin pt-24 pb-32`}>
        <section className="mt-8 mb-12">
          <h2 className="text-3xl font-black text-center mb-8 text-primary drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">TOP PLAYERS</h2>
          <div className="flex items-end justify-center gap-2 h-64">
            {(() => {
              if (isBootstrapping || leaderboard.length < 3) return <div className="text-white text-center w-full">Loading...</div>;
              const top3 = leaderboard.slice(0, 3);
              const p1 = top3[0]; const p2 = top3[1]; const p3 = top3[2];
              return (
                <>
                  {p2 && (
                    <div className="flex flex-col items-center w-1/3">
                      <div className="relative mb-2">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-400 overflow-hidden bg-surface-container-high p-1 flex items-center justify-center text-2xl font-black text-slate-400">
                          {p2.first_name?.[0] || 'A'}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-slate-400 text-slate-900 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black">2</div>
                      </div>
                      <div className="w-full bg-slate-500 h-24 rounded-t-2xl border-x-4 border-t-4 border-slate-600 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.3)]">
                        <span className="font-black text-white drop-shadow-md truncate w-full text-center px-1">{p2.first_name || p2.username || 'Anon'}</span>
                        <span className="text-xs font-bold text-slate-200">{formatNumber(p2.points)}</span>
                      </div>
                    </div>
                  )}
                  {p1 && (
                    <div className="flex flex-col items-center w-1/3 animate-bounce-slow">
                      <div className="relative mb-2">
                        <div className="w-20 h-20 rounded-full border-4 border-[#FFD200] overflow-hidden bg-surface-container-high p-1 shadow-[0_0_20px_rgba(255,210,0,0.4)] flex items-center justify-center text-3xl font-black text-[#FFD200]">
                          {p1.first_name?.[0] || 'A'}
                        </div>
                        <div className="absolute -top-3 -right-2 bg-[#FFD200] text-slate-900 w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-black animate-pulse">1</div>
                      </div>
                      <div className="w-full bg-[#FFD200] h-32 rounded-t-2xl border-x-4 border-t-4 border-[#b29300] relative overflow-hidden flex flex-col items-center justify-center shadow-[0_12px_0_rgba(0,0,0,0.3)]">
                        <span className="font-black text-slate-900 uppercase truncate w-full text-center px-1">{p1.first_name || p1.username || 'Anon'}</span>
                        <span className="text-xs font-bold text-on-primary-container">{formatNumber(p1.points)}</span>
                      </div>
                    </div>
                  )}
                  {p3 && (
                    <div className="flex flex-col items-center w-1/3">
                      <div className="relative mb-2">
                        <div className="w-16 h-16 rounded-full border-4 border-orange-700 overflow-hidden bg-surface-container-high p-1 flex items-center justify-center text-2xl font-black text-orange-700">
                          {p3.first_name?.[0] || 'A'}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-orange-700 text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black">3</div>
                      </div>
                      <div className="w-full bg-orange-800 h-20 rounded-t-2xl border-x-4 border-t-4 border-orange-950 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.3)]">
                        <span className="font-black text-white drop-shadow-md truncate w-full text-center px-1">{p3.first_name || p3.username || 'Anon'}</span>
                        <span className="text-xs font-bold text-orange-200">{formatNumber(p3.points)}</span>
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

      <section id="section-daily" className={`${activeTab === 'daily' ? 'block' : 'hidden'} max-w-md mx-auto px-safe-margin pt-24 pb-32`}>
        <section className="mb-12 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-primary-container rounded-3xl border-4 border-black hard-shadow flex flex-col items-center justify-center rotate-3 bloom-cyan">
              <span className="text-black text-xs font-black uppercase opacity-80">STREAK</span>
              <span className="text-black text-5xl font-black -mt-2">{streak}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-secondary-fixed text-black px-3 py-1 rounded-full border-2 border-black text-xs font-black shadow-md">
              DAYS
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
                            <span className="material-symbols-outlined text-blue-400">payments</span>
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

      <section id="section-profile" className={`${activeTab === 'profile' ? 'block' : 'hidden'} max-w-md mx-auto px-safe-margin pt-24 pb-32 space-y-8`}>
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl border-4 border-black bg-primary-container hard-shadow overflow-hidden flex items-center justify-center">
              <img className="w-full h-full object-cover" alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbgo3EFCp2GF63FyydsRlpKJqpgvUVpdo_JimN6CQE5BRdbNTUoZSD85lP6SFiWMiI2GHo0dggr_PzjNB07gW6O8tL-coc1gJyQiPASWiVQwistu4P8SbodDNRNcThdbOGzr5ZKEXplXn1KpxQcoNu8-N2AXvAWU_YQkSzvcGKkNFmw53-a0JAEzi6FYuElsCbpaZjVpEW8jCKpxOTBsRznjVT57K_f4ZA1Aa6EQbQMHZIEGbFVFgeOx_3yjSukpASrvnal1ud7Rnd" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-secondary-fixed border-2 border-black px-2 py-1 rounded-md hard-shadow">
              <span className="text-black font-bold text-xs uppercase">LVL {Math.floor(Math.log2(Math.max(1, totalPoints/1000)) + 1)}</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{username}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Elite Tapper Status</p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container border-2 border-black rounded-2xl p-4 hard-shadow flex flex-col justify-between h-32">
            <span className="text-slate-400 text-xs font-bold uppercase">Total Taps</span>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-primary leading-none">{formatNumber(totalPoints)}</span>
              <span className="text-[10px] text-primary/50 font-bold">+{formatNumber(todayTaps)} today</span>
            </div>
          </div>
          <div className="bg-surface-container border-2 border-black rounded-2xl p-4 hard-shadow flex flex-col justify-between h-32">
            <span className="text-slate-400 text-xs font-bold uppercase">Earnings</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary-fixed text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>currency_bitcoin</span>
                <span className="text-3xl font-black text-secondary-fixed leading-none">{formatSol(revenueEarnedLamports)}</span>
              </div>
              <span className="text-[10px] text-secondary-fixed/50 font-bold">SOL EARNED</span>
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
             
             <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
                <div className="bg-black p-2 rounded">
                   <div className="text-slate-500 mb-1">Claimable</div>
                   <div className="font-black text-primary-container">{formatSol(walletClaimableLamports)}</div>
                </div>
                <div className="bg-black p-2 rounded">
                   <div className="text-slate-500 mb-1">Claimed</div>
                   <div className="font-black text-white">{formatSol(revenueClaimedLamports)}</div>
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
      </nav>"""

    new_content = content[:shop_start] + replacement + content[nav_end:]
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("Rewritten successfully")

if __name__ == '__main__':
    rewrite()

// ==================== Research Life Simulator v2 ====================
// 科研人生模拟器 - 爆款升级版

var G = {
    name:'', field:'', year:2020, age:18,
    stage:0, substage:0,
    intel:50, energy:100, social:20, stress:10, fame:0, happy:80,
    papers:0, topPapers:0, patents:0, money:0, funding:0,
    students:0, awards:0, teaching:0,
    gpa:3.0, hasPhd:false, hasMaster:false, isAbroad:false,
    mentor:'', mentorType:'', partner:false, burnout:false, hasJob:false,
    hasCat:false, hasStartup:false, reviewer:false, phdYears:0,
    traits:[], // earned traits that affect future events
    log:[], achievements:[], turnCount:0,
    yearSummary:[], bgmOn:false
};

// Mentor types (10. 导师性格系统)
var MENTOR_TYPES={
    push:{name:'Push型导师',desc:'每天催进度，高压但高产',stressMod:3,intelMod:2,icon:'😤'},
    free:{name:'放羊型导师',desc:'基本不管你，自由但迷茫',stressMod:-2,happyMod:2,icon:'🐑'},
    academic:{name:'学术大牛导师',desc:'要求极高但资源丰富',intelMod:3,fameMod:1,icon:'🎓'},
    industry:{name:'横向项目导师',desc:'天天做项目，赚钱但没论文',moneyMod:2,stressMod:1,icon:'💰'}
};

var STAGES=['大一新生','大二','大三','大四','研一','研二','研三/博一','博二','博三','博四','博士后','讲师','副教授','教授','杰出学者'];
var FIELD_NAMES={
    CS:'计算机',AI:'人工智能',EE:'电子工程',Cyber:'网络安全',
    Civil:'土木工程',Mech:'机械工程',Energy:'新能源',Material:'材料科学',
    Bio:'生物医学',Chem:'化学',Env:'环境科学',
    Math:'数学',Physics:'物理学',
    Agri:'农学',Food:'食品科学',
    Med:'临床医学',Pharm:'药学',
    Econ:'经济学',Law:'法学',Edu:'教育学',Psych:'心理学',
    Art:'艺术设计',Music:'音乐',Film:'影视传媒'
};
// Field categories for shared events
var FIELD_CAT={
    CS:'信息',AI:'信息',EE:'信息',Cyber:'信息',
    Civil:'工学',Mech:'工学',Energy:'工学',Material:'工学',
    Bio:'生化',Chem:'生化',Env:'生化',
    Math:'理学',Physics:'理学',
    Agri:'农学',Food:'农学',
    Med:'医学',Pharm:'医学',
    Econ:'人文',Law:'人文',Edu:'人文',Psych:'人文',
    Art:'艺术',Music:'艺术',Film:'艺术'
};

// Audio context for sound effects
var audioCtx;
function playSound(type){
    try{
        if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
        var o=audioCtx.createOscillator(),g=audioCtx.createGain();
        o.connect(g);g.connect(audioCtx.destination);
        g.gain.value=0.08;
        if(type==='good'){o.frequency.value=523;o.type='sine';g.gain.setValueAtTime(0.08,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.5);o.start();o.stop(audioCtx.currentTime+0.5);}
        else if(type==='great'){o.frequency.value=659;o.type='sine';g.gain.setValueAtTime(0.1,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.8);o.start();setTimeout(function(){var o2=audioCtx.createOscillator(),g2=audioCtx.createGain();o2.connect(g2);g2.connect(audioCtx.destination);o2.frequency.value=784;o2.type='sine';g2.gain.value=0.1;g2.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.6);o2.start();o2.stop(audioCtx.currentTime+0.6);},200);o.stop(audioCtx.currentTime+0.8);}
        else if(type==='bad'){o.frequency.value=200;o.type='sawtooth';g.gain.setValueAtTime(0.06,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.4);o.start();o.stop(audioCtx.currentTime+0.4);}
        else if(type==='click'){o.frequency.value=800;o.type='sine';g.gain.setValueAtTime(0.04,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.1);o.start();o.stop(audioCtx.currentTime+0.1);}
    }catch(e){}
}

function clamp(v,a,b){return Math.min(b,Math.max(a,v));}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function chance(p){return Math.random()*100<p;}
function pick(a){return a[rand(0,a.length-1)];}

var prevStats={};
function mod(c){
    prevStats={intel:G.intel,energy:G.energy,social:G.social,stress:G.stress,fame:G.fame,happy:G.happy,papers:G.papers,topPapers:G.topPapers,money:G.money};
    var sk=['intel','energy','social','stress','fame','happy'];
    var ck=['papers','topPapers','money','funding','patents','students','awards','teaching'];
    Object.keys(c).forEach(function(k){
        if(sk.indexOf(k)>=0)G[k]=clamp(G[k]+c[k],0,100);
        if(ck.indexOf(k)>=0)G[k]=Math.max(0,G[k]+c[k]);
    });
}

function addLog(t,type){G.log.push({year:G.year,text:t,type:type||''});}
function checkAch(id,name,icon){if(G.achievements.find(function(a){return a.id===id;}))return;G.achievements.push({id:id,name:name,icon:icon});showFloat('🏅 '+name,'good');addLog('🏅 解锁成就: '+name,'good');}

// Floating notification
function showFloat(text,type){
    var el=document.createElement('div');
    el.className='float-notify '+(type||'good');
    el.textContent=text;
    document.body.appendChild(el);
    setTimeout(function(){el.remove();},1300);
}

// ==================== BGM System (6) ====================
var bgmInterval;
function toggleBgm(){
    G.bgmOn=!G.bgmOn;
    var btn=document.getElementById('bgmBtn');
    if(btn)btn.textContent=G.bgmOn?'🔊':'🔇';
    if(G.bgmOn)startBgm();else stopBgm();
}
function startBgm(){
    if(bgmInterval)return;
    bgmInterval=setInterval(function(){
        if(!G.bgmOn||!audioCtx)return;
        try{
            var notes=[262,294,330,349,392,440,494,523];
            var n=notes[rand(0,notes.length-1)];
            var o=audioCtx.createOscillator(),g=audioCtx.createGain();
            o.connect(g);g.connect(audioCtx.destination);
            o.frequency.value=n;o.type='sine';
            g.gain.setValueAtTime(0.015,audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+1.5);
            o.start();o.stop(audioCtx.currentTime+1.5);
        }catch(e){}
    },2000);
}
function stopBgm(){if(bgmInterval){clearInterval(bgmInterval);bgmInterval=null;}}

// ==================== Typewriter Effect (7) ====================
var typeTimer;
function typeWrite(el,text,cb){
    if(typeTimer)clearInterval(typeTimer);
    el.textContent='';
    var i=0;
    typeTimer=setInterval(function(){
        if(i<text.length){el.textContent+=text[i];i++;}
        else{clearInterval(typeTimer);typeTimer=null;if(cb)cb();}
    },18);
}

// ==================== Fullscreen Celebration (8) ====================
function showCelebration(emoji,text){
    var overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);animation:fadeIn 0.3s ease';
    overlay.innerHTML='<div style="font-size:6rem;animation:bounce 0.8s ease">'+emoji+'</div><div style="font-size:1.8rem;color:#ffd700;font-weight:700;margin-top:1rem;text-shadow:0 0 20px rgba(255,215,0,0.5)">'+text+'</div><div style="font-size:0.9rem;color:#888;margin-top:1.5rem">点击继续</div>';
    // Particles
    for(var p=0;p<20;p++){
        var particle=document.createElement('div');
        var px=rand(10,90),py=rand(10,90),size=rand(4,12);
        var colors=['#667eea','#f093fb','#ffd700','#52c41a','#f5576c'];
        particle.style.cssText='position:absolute;left:'+px+'%;top:'+py+'%;width:'+size+'px;height:'+size+'px;background:'+pick(colors)+';border-radius:50%;animation:floatUp '+rand(10,25)/10+'s ease infinite;opacity:0.7';
        overlay.appendChild(particle);
    }
    overlay.onclick=function(){overlay.remove();};
    document.body.appendChild(overlay);
    playSound('great');
}

// ==================== Year Summary (3) ====================
function showYearSummary(){
    if(G.yearSummary.length===0)return;
    var overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8)';
    var items=G.yearSummary.map(function(s){return'<div style="padding:0.3rem 0;font-size:0.9rem;color:#aaa">'+s+'</div>';}).join('');
    overlay.innerHTML='<div style="background:#13132e;border:1px solid #252550;border-radius:16px;padding:2rem;max-width:400px;width:90%;text-align:center"><div style="font-size:1.3rem;color:#667eea;font-weight:700;margin-bottom:1rem">📅 '+G.year+'年度回顾</div>'+items+'<div style="margin-top:1rem;font-size:0.75rem;color:#555">点击继续</div></div>';
    overlay.onclick=function(){overlay.remove();};
    document.body.appendChild(overlay);
    G.yearSummary=[];
}

// ==================== Meme Quotes ====================
var MEMES={
    rejectPaper:['Reviewer 2: "This paper lacks novelty." 你：???','审稿人："建议大修"——其实就是让你重写','拒稿信比情书来得还频繁...'],
    gradLife:['科研就是：白天做实验，晚上改论文，梦里跑代码','导师说"再改改"的意思是"推倒重来"','读博就是一个人的夜路，偶尔有论文作伴'],
    work:['DDL是第一生产力','改论文改到怀疑人生，发出去又觉得还行','写代码一时爽，debug火葬场'],
    success:['今天的我，配得上所有的好运！','知道这一刻为什么值得吗？因为之前的每一天都没白费','从投稿到接收，中间隔了一个太平洋的焦虑'],
    life:['食堂的麻辣烫，是科研人最后的倔强','实验室的灯永远比宿舍先亮','和猫比，导师催得更紧']
};

// ==================== EVENTS ====================
function getEvents(){
    var s=G.stage, pool=[];

    // ===== 大一 (0) =====
    if(s===0){
        pool.push({emoji:'🎒',title:'大一：新世界的大门',
            desc:'你怀着忐忑和期待踏入了'+FIELD_NAMES[G.field]+'专业的教室。\n一切都是新鲜的——室友、课程、社团...',
            choices:[
                {text:'泡图书馆，当学霸',icon:'📚',effect:'智力+15 GPA↑',fn:function(){mod({intel:15,energy:-10});G.gpa=3.7;addLog('大一GPA 3.7，年级前10%','good');playSound('good');showFloat('📚 学霸觉醒！','good');G.traits.push('studious');}},
                {text:'疯狂加社团，做社交达人',icon:'🎭',effect:'人脉+22 幸福+10',fn:function(){mod({social:22,happy:10,intel:3});addLog('加了5个社团，成了社交达人','good');G.traits.push('social_butterfly');}},
                {text:'通宵打游戏，享受自由',icon:'🎮',effect:'幸福+20 智力-8',fn:function(){mod({happy:20,energy:10,intel:-8});G.gpa=2.5;addLog('大一在王者荣耀中度过...','');G.traits.push('gamer');}},
                {text:'直接找教授进实验室',icon:'🔬',effect:'智力+20 声望+8',fn:function(){mod({intel:20,fame:8,energy:-15});G.mentor='本科导师';addLog('大一就进了实验室！比同龄人早了2年','good');playSound('great');showFloat('🔬 科研萌芽！','good');G.traits.push('early_research');}}
            ]
        });
        if(chance(40))pool.push({emoji:'🍜',title:'军训结束后...',desc:'军训终于结束了，皮肤黑了三度。室友提议去庆祝一下。',
            choices:[
                {text:'和室友撸串到半夜',icon:'🍻',effect:'人脉+10 幸福+10',fn:function(){mod({social:10,happy:10});addLog('和室友建立了深厚友谊','good');}},
                {text:'回宿舍预习明天的课',icon:'📖',effect:'智力+5',fn:function(){mod({intel:5});addLog('卷王之路从大一第一天开始','');}}
            ]
        });
        if(chance(30))pool.push({emoji:'💻',title:'第一堂编程课',desc:'老师在黑板上写下了 printf("Hello World"); \n你盯着屏幕上的光标，一脸懵...',
            choices:[
                {text:'熬夜自学，把C语言啃下来',icon:'⌨️',effect:'智力+15 精力-10',fn:function(){mod({intel:15,energy:-10});addLog('学会了编程！解锁新技能','good');checkAch('code','Hello World','💻');}},
                {text:'找学长要往年题库',icon:'📋',effect:'人脉+5 智力+3',fn:function(){mod({social:5,intel:3});addLog('考试靠题库蒙混过关','');}},
                {text:'直接放弃，这课太难了',icon:'😵',effect:'压力-5 智力-3',fn:function(){mod({stress:-5,intel:-3});addLog('编程课挂科了...补考吧','bad');playSound('bad');}}
            ]
        });
    }

    // ===== 大二 (1) =====
    if(s===1){
        pool.push({emoji:'📖',title:'大二：专业课地狱',
            desc:'数据结构、概率论、信号处理...每天都在DDL的边缘疯狂试探。',
            choices:[
                {text:'组队参加竞赛',icon:'🏆',effect:'智力+12 声望+12',fn:function(){mod({intel:12,fame:12,energy:-10});if(chance(55)){G.awards++;addLog('竞赛获得省一等奖！','good');playSound('great');showFloat('🏆 获奖了！','great');checkAch('contest','竞赛达人','🏅');}else{addLog('没获奖，但过程收获很大','');}}},
                {text:'去大厂日常实习',icon:'💼',effect:'积蓄+3万 人脉+15',fn:function(){G.money+=3;mod({social:15,intel:5});addLog('在大厂实习，见识了工业界','good');}},
                {text:'跟导师做科研项目',icon:'🔬',effect:'智力+15 声望+8',fn:function(){mod({intel:15,fame:8});G.mentor=G.mentor||'科研导师';if(chance(30)){G.papers++;addLog('本科就发了第一篇论文！','good');playSound('great');showFloat('📄 本科发论文！','great');checkAch('undergrad_paper','本科学术之星','⭐');}else{addLog('项目在推进中，暂时没出成果','');}}},
                {text:'副业赚钱：做家教/外包',icon:'💰',effect:'积蓄+4万 幸福+5',fn:function(){G.money+=4;mod({happy:5,social:5});addLog('课余做家教赚了不少','');}}
            ]
        });
        if(chance(40))pool.push({emoji:'❤️',title:'心动信号',desc:'在'+pick(['图书馆角落','实验室','食堂','篮球场','社团活动'])+'，你注意到一个让你心跳加速的人...',
            choices:[
                {text:'"要不...一起去吃饭？"',icon:'💌',effect:'幸福±?',fn:function(){if(chance(55)){G.partner=true;mod({happy:25,social:5});addLog('在一起了！甜蜜暴击','good');playSound('great');showFloat('❤️ 恋爱了！','great');checkAch('love','恋爱中','❤️');}else{mod({happy:-12});addLog('被发了好人卡...','bad');playSound('bad');showFloat('💔 被拒','bad');}}},
                {text:'每天"偶遇"对方',icon:'👀',effect:'幸福+5',fn:function(){mod({happy:5});addLog('暗恋的感觉酸酸甜甜的','');}},
                {text:'单身保平安',icon:'📚',effect:'智力+5 精力+5',fn:function(){mod({intel:5,energy:5});addLog('"我要搞学术！"你对自己说','');}}
            ]
        });
        if(chance(30)&&!G.burnout)pool.push({emoji:'😷',title:'通宵后遗症',desc:'连续三天熬夜赶DDL，你的身体发出了抗议...\n头痛、眼花、免疫力下降。',
            choices:[
                {text:'不行了，今天必须早睡',icon:'🛌',effect:'精力+20 幸福+5',fn:function(){mod({energy:20,happy:5});addLog('睡了12小时，活过来了','good');}},
                {text:'喝红牛继续肝',icon:'☕',effect:'智力+3 精力-10 压力+5',fn:function(){mod({intel:3,energy:-10,stress:5});addLog('又是一个不眠之夜...','');}}
            ]
        });
    }

    // ===== 大三 (2) =====
    if(s===2){
        pool.push({emoji:'🔀',title:'大三：人生岔路口',
            desc:'这是最关键的一年。身边人都在焦虑——\n考研？出国？就业？保研？\n你必须做出选择。',
            choices:[
                {text:'考研！冲985/211',icon:'📚',effect:'智力+15 压力+20 幸福-10',fn:function(){mod({intel:15,stress:20,happy:-10});addLog('6月开始备考，每天学14小时','');G.traits.push('kaoyan');}},
                {text:'出国！GRE+托福走起',icon:'✈️',effect:'智力+10 积蓄-6万',fn:function(){mod({intel:10});G.money-=6;G.isAbroad=true;addLog('开始漫长的留学申请之路','');G.traits.push('abroad');}},
                {text:'秋招！简历海投',icon:'💼',effect:'积蓄+15万 人脉+15',fn:function(){G.money+=15;G.hasJob=true;mod({social:15,happy:8});addLog('拿到offer了！年薪不错','good');playSound('good');}},
                {text:'争取保研名额',icon:'🎯',effect:'声望+12',fn:function(){if(G.gpa>=3.4&&G.intel>=60){G.hasMaster=true;mod({fame:12});addLog('排名靠前，成功保研！','good');playSound('great');showFloat('🎉 保研成功！','great');checkAch('baoyan','保研达人','🎯');}else{mod({stress:25,happy:-15});addLog('GPA差了一点，保研失败...','bad');playSound('bad');showFloat('😢 保研失败','bad');}}}
            ]
        });
        if(chance(35))pool.push({emoji:'💡',title:'创业机会',desc:'学长找你一起做创业项目，做一个'+pick([G.field+'领域的SaaS','AI驱动的教育平台','智能硬件产品'])+'\n已经有天使投资人感兴趣了。',
            choices:[
                {text:'加入！搏一把',icon:'🚀',effect:'人脉+20 积蓄±?',fn:function(){mod({social:20,stress:15});if(chance(25)){G.money+=25;mod({fame:20});addLog('创业项目融到天使轮！','good');playSound('great');showFloat('💰 融资成功！','great');G.hasStartup=true;checkAch('startup','创业先锋','🚀');}else{G.money-=5;addLog('创业失败了，但学到了很多','bad');playSound('bad');}}},
                {text:'还是专注自己的路',icon:'📋',effect:'智力+3',fn:function(){mod({intel:3});addLog('婉拒了创业邀请','');}}
            ]
        });
        if(chance(25))pool.push({emoji:'🏆',title:'国际比赛邀请',desc:'因为之前的表现，你被选入'+pick(['ACM-ICPC','数学建模美赛','RoboMaster','CTF网络安全'])+'参赛队',
            choices:[
                {text:'全力备赛',icon:'🔥',effect:'智力+15 声望+15 精力-15',fn:function(){mod({intel:15,fame:15,energy:-15});if(chance(45)){G.awards++;addLog('国际比赛获奖！简历闪闪发光','good');playSound('great');showFloat('🏆 国际奖项！','great');checkAch('intl_award','国际视野','🌍');}else{addLog('没获奖但拓展了国际视野','');}}}
            ]
        });
    }

    // ===== 大四 (3) =====
    if(s===3){
        if(G.isAbroad){
            pool.push({emoji:'✈️',title:'大四：Offer Season',desc:'漫长的等待后，邮箱终于叮了一声...',
                choices:[
                    {text:'接受Top30全奖PhD',icon:'🌟',effect:'声望+30 智力+10',fn:function(){G.hasPhd=true;G.hasMaster=true;mod({fame:30,intel:10});addLog('Top30全奖PhD！起飞！','good');playSound('great');showFloat('🎓 PhD offer！','great');checkAch('top_phd','名校博士','🎓');}},
                    {text:'接受Top100硕士',icon:'🎓',effect:'声望+15',fn:function(){G.hasMaster=true;mod({fame:15});addLog('留学硕士开始新生活','good');}},
                    {text:'全拒德...留在国内',icon:'😢',effect:'压力+15',fn:function(){G.isAbroad=false;mod({stress:15,happy:-10});addLog('申请全聚德了...','bad');playSound('bad');}}
                ]
            });
        }else if(G.hasJob&&!G.hasMaster){
            pool.push({emoji:'💼',title:'大四：社会还是学校？',desc:'手里的offer年薪'+rand(25,45)+'万，但你又有点想读研...',
                choices:[
                    {text:'去工作，先赚钱',icon:'🏢',effect:'积蓄+18万 幸福+10',fn:function(){G.money+=18;mod({happy:10,social:10});addLog('入职大厂，开始搬砖','good');}},
                    {text:'放弃offer去读研',icon:'📚',effect:'智力+10',fn:function(){G.hasMaster=true;G.hasJob=false;mod({intel:10});addLog('放弃高薪选择学术，勇敢的人','');}}
                ]
            });
        }else{
            var up=G.intel>=55||G.hasMaster;
            pool.push({emoji:'🎓',title:'大四：命运揭晓',desc:up?'上岸了！你即将进入研究生阶段。':'分数线边缘，结果揭晓的那一刻...',
                choices:up?[
                    {text:'学术型硕士',icon:'🔬',effect:'智力+10',fn:function(){G.hasMaster=true;mod({intel:10});addLog('学硕入学','good');}},
                    {text:'直接读博！',icon:'🚀',effect:'智力+15 压力+20',fn:function(){G.hasPhd=true;G.hasMaster=true;mod({intel:15,stress:20});addLog('直博！','good');checkAch('zhibo','直博勇士','🚀');showFloat('🚀 直博！','great');playSound('great');}}
                ]:[
                    {text:'二战！我不信命',icon:'⚔️',effect:'压力+25 智力+12',fn:function(){mod({stress:25,intel:12,happy:-15});if(chance(72)){G.hasMaster=true;addLog('二战上岸！！！','good');playSound('great');showFloat('⚔️ 二战成功！','great');checkAch('erzhan','二战战神','⚔️');}else{addLog('又差了几分...','bad');playSound('bad');showFloat('😭','bad');}}},
                    {text:'算了，工作吧',icon:'💼',effect:'积蓄+12万',fn:function(){G.money+=12;mod({happy:5});addLog('找了份还不错的工作','');}},
                    {text:'gap year环游世界',icon:'🌏',effect:'幸福+25 精力+15',fn:function(){mod({happy:25,energy:15});G.money-=5;addLog('用一年找到了自己真正想要的','good');checkAch('gap','间隔年旅者','🌏');}}
                ]
            });
        }
        if(chance(45))pool.push({emoji:'📝',title:'毕业论文修罗场',desc:'"你的论文还有很多问题。" 导师的消息让你心里一凉。\n答辩在两周后...',
            choices:[
                {text:'通宵一周搞定它',icon:'🌙',effect:'智力+8 精力-20',fn:function(){mod({intel:8,energy:-20,stress:10});addLog('论文在答辩前一天定稿...','');}},
                {text:'认真改好每一个细节',icon:'✍️',effect:'智力+12 声望+5',fn:function(){mod({intel:12,fame:5});addLog('毕业论文获得优秀！','good');playSound('good');checkAch('good_thesis','论文优秀','📝');}}
            ]
        });
    }

    // ===== 研一 (4) =====
    if(s===4){
        pool.push({emoji:'🔬',title:'研一：科研正式开始',
            desc:G.mentor?'你之前的导师经验让你比同届快了不少。':'导师分配了课题，一切从零开始。'+'\n组会上师兄师姐侃侃而谈，你一脸懵逼...',
            choices:[
                {text:'疯狂读论文，找灵感',icon:'📖',effect:'智力+15 压力+8',fn:function(){mod({intel:15,stress:8});addLog('读了200+篇论文，终于找到方向','good');}},
                {text:'跟师兄学技术',icon:'🧪',effect:'智力+10 人脉+10',fn:function(){mod({intel:10,social:10});addLog('师兄教会了你很多实验技巧','good');}},
                {text:'偷偷做自己感兴趣的东西',icon:'💡',effect:'智力+12 幸福+5',fn:function(){mod({intel:12,happy:5});addLog('在导师课题外搞了个side project','');}},
                {text:'参加学术暑期班',icon:'🏫',effect:'智力+10 人脉+15 声望+5',fn:function(){mod({intel:10,social:15,fame:5});addLog('暑期班认识了很多同行','good');}}
            ]
        });
        if(chance(45))pool.push({emoji:'😤',title:'导师语录',desc:'"'+pick([
            '你这个idea三年前就有人做过了','我觉得你还需要再想想','这个实验设计有问题，推倒重来',
            '你看看隔壁组的同学，人家都发了两篇了','下周组会你来讲，准备好了吗？','你的进度有点慢啊'
        ])+'"',
            choices:[
                {text:'虚心接受，加倍努力',icon:'💪',effect:'智力+8 压力+10',fn:function(){mod({intel:8,stress:10});addLog('导师虐我千百遍，我待导师如初恋','');}},
                {text:'在心里疯狂吐槽',icon:'😤',effect:'压力-8 幸福+5',fn:function(){mod({stress:-8,happy:5});addLog(pick(MEMES.gradLife),'');}},
                {text:'偷偷更新简历',icon:'📋',effect:'压力-5',fn:function(){mod({stress:-5});addLog('更新了一下简历...以防万一','');}}
            ]
        });
    }

    // ===== 研二 (5) =====
    if(s===5){
        pool.push({emoji:'📄',title:'研二：出成果的关键年',
            desc:'实验终于有了眉目，数据看起来不错。\n是时候写论文了！',
            choices:[
                {text:'冲顶会！AAAI/NeurIPS/CVPR',icon:'⭐',effect:'智力+12 压力+18',fn:function(){mod({intel:12,stress:18});if(chance(28+G.intel/4)){G.topPapers++;G.papers++;addLog('顶会中了！！！','good');playSound('great');showFloat('⭐ 顶会Accept！','great');checkAch('top_conf','顶会作者','⭐');}else{addLog(pick(MEMES.rejectPaper),'bad');playSound('bad');showFloat('💔 Reject...','bad');G.papers++;addLog('改投期刊，被接收了','');}}},
                {text:'稳妥发SCI期刊',icon:'📄',effect:'论文+2 压力+5',fn:function(){G.papers+=2;mod({stress:5});addLog('发了2篇SCI，心态稳了','good');playSound('good');checkAch('first_paper','初出茅庐','📄');}},
                {text:'做开源项目冲GitHub星星',icon:'💻',effect:'声望+18 人脉+10',fn:function(){mod({fame:18,social:10});addLog('GitHub项目获得500+ star','good');checkAch('opensource','开源贡献者','💻');}},
                {text:'实习攒工业经验',icon:'💼',effect:'积蓄+10万 人脉+12',fn:function(){G.money+=10;mod({social:12});addLog('去'+pick(['腾讯','字节','华为','阿里','微软'])+'实习了','good');}}
            ]
        });
        if(chance(40))pool.push({emoji:'💥',title:'论文被拒了...',
            desc:pick(MEMES.rejectPaper)+'\n审稿人的评语让你血压飙升。',
            choices:[
                {text:'冷静分析，认真修改',icon:'✍️',effect:'智力+10 压力+5',fn:function(){mod({intel:10,stress:5});if(chance(75)){G.papers++;addLog('修改后换刊成功！','good');playSound('good');}else{addLog('又被拒了...继续改','bad');}}},
                {text:'在论文互助群里吐槽',icon:'😤',effect:'压力-12 人脉+5',fn:function(){mod({stress:-12,social:5});addLog('"审稿人二号是不是我的仇人？"——你在群里说','');}},
                {text:'怒而写rebuttal反驳',icon:'🔥',effect:'智力+8 声望+5',fn:function(){mod({intel:8,fame:5});if(chance(40)){G.papers++;addLog('rebuttal成功！论文被接收','good');playSound('great');checkAch('rebuttal','据理力争','🔥');}else{addLog('rebuttal被驳回...世界太残忍','bad');playSound('bad');}}}
            ]
        });
    }

    // ===== 研三/博一 (6) =====
    if(s===6){
        if(!G.hasPhd){
            pool.push({emoji:'🎓',title:'硕士毕业：接下来呢？',desc:'你有'+G.papers+'篇论文，GPA '+G.gpa.toFixed(1)+'。\n毕业答辩通过了，但前路还长...',
                choices:[
                    {text:'继续读博',icon:'📚',effect:'智力+12 压力+15',fn:function(){G.hasPhd=true;mod({intel:12,stress:15});addLog('决定读博！向更深处探索','good');checkAch('master','硕士毕业','🎓');}},
                    {text:'出国读博',icon:'✈️',effect:'声望+15 智力+10',fn:function(){G.hasPhd=true;G.isAbroad=true;mod({fame:15,intel:10});addLog('海外PhD，新的征程','good');checkAch('abroad','海归精英','🌍');}},
                    {text:'去企业搞钱',icon:'💼',effect:'积蓄+25万',fn:function(){G.money+=25;mod({happy:10,social:10});addLog('硕士毕业入职，年薪35万+','good');checkAch('master','硕士毕业','🎓');}},
                    {text:'考公上岸',icon:'🏛️',effect:'压力-10',fn:function(){if(chance(35)){mod({happy:15,stress:-10});G.money+=6;addLog('考公上岸！稳了','good');checkAch('civil','体制内选手','🏛️');}else{addLog('考公没中...','bad');}}}
                ]
            });
        }else{
            pool.push({emoji:'🧪',title:'博士第一年',desc:'博士和硕士完全不一样。\n没有标准答案，没有人告诉你该做什么。\n你需要自己定义问题、解决问题。',
                choices:[
                    {text:'选热门方向，跟着trend跑',icon:'🔥',effect:'论文+1 压力+8',fn:function(){G.papers++;mod({stress:8});addLog('热门方向容易出论文，但竞争激烈','');}},
                    {text:'选冷门方向，赌一把大的',icon:'🎲',effect:'智力+18',fn:function(){mod({intel:18});addLog('冷门方向可能有大突破...也可能什么都没有','');G.traits.push('risk_taker');}},
                    {text:'跟导师方向走，有资源',icon:'🤝',effect:'人脉+10 智力+10',fn:function(){mod({social:10,intel:10});addLog('跟导师走，有项目有资源','good');}}
                ]
            });
        }
    }

    // ===== 博二 (7) =====
    if(s===7&&G.hasPhd){
        G.phdYears++;
        pool.push({emoji:'🔥',title:'博士攻坚：'+pick(['实验到凌晨3点','第N次推翻假设','调参调到怀疑人生','代码bug找了一周']),
            desc:pick(MEMES.work)+'\n\n你的研究在'+FIELD_NAMES[G.field]+'方向遇到了'+pick(['瓶颈','技术难题','理论矛盾','数据问题'])+'...',
            choices:[
                {text:'死磕到底，不破不立',icon:'💪',effect:'智力+18 压力+18',fn:function(){mod({intel:18,stress:18});if(chance(35+G.intel/5)){G.topPapers++;G.papers++;addLog('突破了！顶刊论文发表！','good');playSound('great');showFloat('🌟 顶刊Accept！！','great');checkAch('top_journal','顶刊作者','📰');}else{G.papers++;addLog('发了一篇普通期刊，顶刊还在路上','');}}},
                {text:'换个角度试试',icon:'🔄',effect:'智力+10 压力-5',fn:function(){mod({intel:10,stress:-5});G.papers++;addLog('换了思路，意外有了新发现','good');}},
                {text:'和国外团队合作',icon:'🌍',effect:'声望+15 人脉+15',fn:function(){mod({fame:15,social:15});if(chance(50)){G.papers++;G.topPapers++;addLog('国际合作顶刊发表！','good');playSound('great');}else{addLog('合作进展缓慢','');}}},
                {text:'做工程实现，拿专利',icon:'⚙️',effect:'专利+1 积蓄+5万',fn:function(){G.patents++;G.money+=5;mod({intel:5});addLog('拿到了发明专利','good');checkAch('patent','发明家','⚙️');}}
            ]
        });
        if(chance(55))pool.push({emoji:'😰',title:'博士中期危机',
            desc:'凌晨2点，你盯着电脑屏幕，论文写了开头就写不下去了。\n同届的已经发了3篇顶会，而你...\n\n'+pick(MEMES.gradLife),
            choices:[
                {text:'咬牙坚持，我选择的路',icon:'💪',effect:'智力+12 压力+10',fn:function(){mod({intel:12,stress:10});addLog('最难的时候挺过来了','good');}},
                {text:'去看心理咨询',icon:'💆',effect:'幸福+15 压力-25',fn:function(){mod({happy:15,stress:-25,energy:10});addLog('心理咨询帮了大忙','good');checkAch('mental','关注心理健康','💆');}},
                {text:'给自己放个假',icon:'🏖️',effect:'精力+20 幸福+15 压力-15',fn:function(){mod({energy:20,happy:15,stress:-15});addLog('出去旅行了一周，重新充电','good');}},
                {text:'退学的念头越来越强...',icon:'🚪',effect:'压力-30',fn:function(){if(G.stress>70&&chance(30)){G.hasPhd=false;mod({stress:-30});addLog('最终选择了退学...','bad');playSound('bad');}else{mod({stress:-20});addLog('想了想还是继续坚持吧','');}}}
            ]
        });
    }

    // ===== 博三 (8) =====
    if(s===8&&G.hasPhd){
        G.phdYears++;
        var req=G.topPapers>=1?'✅ 论文要求达标':'❌ 还差小论文/顶刊';
        pool.push({emoji:'📝',title:'博三：冲刺毕业',desc:'毕业要求检查：'+req+'\n已有论文: '+G.papers+'篇 (顶刊'+G.topPapers+')\n\n时间紧迫，你的选择是...',
            choices:[
                {text:'疯狂冲论文',icon:'📄',effect:'论文+2 压力+15 精力-20',fn:function(){G.papers+=2;if(chance(35)){G.topPapers++;}mod({stress:15,energy:-20});addLog('爆肝出论文，向毕业冲刺','good');}},
                {text:'打磨博士论文',icon:'📖',effect:'智力+12',fn:function(){mod({intel:12,stress:10});addLog('博士大论文写了8万字','good');}},
                {text:'边找工作边写论文',icon:'🔍',effect:'人脉+10 压力+10',fn:function(){mod({social:10,stress:10});addLog('一边面试一边赶论文，累但充实','');}},
                {text:'延期一年（太常见了）',icon:'😢',effect:'压力-10 幸福-10',fn:function(){mod({stress:-10,happy:-10});addLog('延期了...但多了时间','');G.phdYears++;}}
            ]
        });
    }

    // ===== 博四/博后 (9-10) =====
    if(s>=9&&s<=10){
        pool.push({emoji:'🏫',title:s===9?'博士后第一年':'博后第二年',
            desc:'博后是学术界的"试用期"。你需要：\n1. 大量发表论文\n2. 建立独立研究方向\n3. 为求职做准备',
            choices:[
                {text:'冲论文！量产模式',icon:'📄',effect:'论文+3',fn:function(){G.papers+=3;if(chance(40)){G.topPapers++;}mod({stress:15,energy:-15});addLog('论文井喷！','good');playSound('good');}},
                {text:'申请青年基金',icon:'💰',effect:'声望+15 基金+25万',fn:function(){if(chance(35+G.fame/4)){G.funding+=25;mod({fame:15});addLog('博后基金中了！','good');playSound('great');checkAch('first_fund','基金破冰','💰');}else{addLog('基金没中','bad');}}},
                {text:'申请高校教职',icon:'🎓',effect:'声望+10',fn:function(){mod({fame:10,stress:10});addLog('开始面试高校','');}},
                {text:'去企业，薪资翻倍',icon:'🏢',effect:'积蓄+40万 幸福+10',fn:function(){G.money+=40;mod({happy:10});addLog('进入企业研究院，年薪80万+','good');}}
            ]
        });
    }

    // ===== 讲师 (11) =====
    if(s===11){
        pool.push({emoji:'👨‍🏫',title:'讲师：教学科研两手抓',
            desc:'入职高校了！\n一边给本科生上课，一边做科研、带研究生、写基金本子...\n时间永远不够用。',
            choices:[
                {text:'冲国自然青年基金！',icon:'💰',effect:'声望+20 基金+50万',fn:function(){if(chance(28+G.fame/4)){G.funding+=50;mod({fame:20});addLog('国自然青年基金中了！！','good');playSound('great');showFloat('💰 国自然中了！','great');checkAch('nsfc','国自然得主','🏅');}else{mod({stress:20,happy:-10});addLog('国自然没中...明年再战','bad');playSound('bad');showFloat('😢 没中...','bad');}}},
                {text:'专心教好课',icon:'📋',effect:'教学+2 幸福+10 学生+5',fn:function(){G.teaching+=2;G.students+=5;mod({happy:10,fame:5});addLog('获得教学优秀奖！学生们都很喜欢你','good');}},
                {text:'和企业合作横向项目',icon:'🏭',effect:'基金+35万 人脉+12',fn:function(){G.funding+=35;mod({social:12});addLog('横向项目到账35万','good');}},
                {text:'招研究生，建团队',icon:'👥',effect:'学生+6 声望+10',fn:function(){G.students+=6;mod({fame:10,energy:-10});addLog('招了第一批研究生','good');checkAch('first_student','初为人师','👨‍🏫');}}
            ]
        });
    }

    // ===== 副教授 (12) =====
    if(s===12){
        pool.push({emoji:'📊',title:'副教授：冲击正教授',
            desc:'距离教授还需要：\n• 顶刊/顶会论文 (当前'+G.topPapers+'篇)\n• 科研经费 (当前'+G.funding+'万)\n• 学术声望 (当前'+G.fame+')',
            choices:[
                {text:'冲Nature/Science子刊',icon:'🌟',effect:'声望+30 压力+25',fn:function(){if(chance(18+G.intel/5+G.fame/5)){G.topPapers+=2;G.papers++;mod({fame:30});addLog('Nature子刊发表！人生高光！','good');playSound('great');showFloat('🌟 NATURE！！','great');checkAch('nature','Nature级学者','🌟');}else{mod({stress:25,happy:-15});addLog('Nature被拒了...审稿人要求太高','bad');playSound('bad');}}},
                {text:'申请面上项目',icon:'💰',effect:'基金+80万 声望+15',fn:function(){if(chance(25+G.fame/4)){G.funding+=80;mod({fame:15});addLog('面上项目80万！','good');playSound('great');}else{addLog('面上项目没中','bad');mod({stress:10});}}},
                {text:'出国访学一年',icon:'✈️',effect:'智力+15 声望+20 人脉+20',fn:function(){mod({intel:15,fame:20,social:20});addLog('在MIT/Stanford/Oxford访学，视野大开','good');}},
                {text:'写一本学术专著',icon:'📖',effect:'声望+18',fn:function(){mod({fame:18,intel:5});addLog('出版了学术专著','good');checkAch('book','著书立说','📖');}}
            ]
        });
    }

    // ===== 教授 (13) =====
    if(s===13){
        pool.push({emoji:'🏆',title:'教授：学术领袖',
            desc:'你已经是'+FIELD_NAMES[G.field]+'领域的知名教授。\n接下来追求什么？',
            choices:[
                {text:'冲杰青/长江学者',icon:'👑',effect:'声望+35',fn:function(){if(G.fame>=70&&G.topPapers>=4&&chance(25)){mod({fame:35});addLog('获得杰青/长江学者称号！！！','good');playSound('great');showFloat('👑 杰出青年！！！','great');checkAch('jieqing','杰出青年','👑');}else{mod({stress:15});addLog('今年差一点...','bad');}}},
                {text:'创办国际学术会议',icon:'📰',effect:'声望+25 人脉+25',fn:function(){mod({fame:25,social:25});addLog('创办的会议影响力越来越大','good');checkAch('conference','会议主席','📰');}},
                {text:'桃李满天下',icon:'👨‍🎓',effect:'学生+15 幸福+15',fn:function(){G.students+=15;mod({happy:15,fame:10});addLog('你的学生们在各个领域发光发热','good');checkAch('mentor','桃李满天下','🌳');}},
                {text:'回归生活',icon:'🏡',effect:'幸福+30 压力-25',fn:function(){mod({happy:30,stress:-25});addLog('更多时间陪家人，人生不只有论文','good');checkAch('balance','平衡人生','⚖️');}}
            ]
        });
    }

    // ===== 条件事件 =====
    if(G.partner&&chance(25)&&s>=1){
        pool.push({emoji:pick(['❤️','💑','🥰']),title:'感情生活',desc:pick([
            '周末和另一半去了趟旅行，暂时忘记了论文的烦恼。',
            '对象抱怨你整天泡在实验室不陪TA...',
            '一起在家做饭，简单的幸福。',
            '因为一个人在外地读博，异地恋很辛苦...'
        ]),choices:[
            {text:'认真经营感情',icon:'❤️',effect:'幸福+12 压力-8',fn:function(){mod({happy:12,stress:-8});addLog('感情稳定是科研的后盾','good');}},
            {text:'科研为重',icon:'📚',effect:'智力+5 幸福-5',fn:function(){mod({intel:5,happy:-5});if(chance(20)){G.partner=false;addLog('分手了...ta说你只有论文没有ta','bad');playSound('bad');showFloat('💔','bad');}else{addLog('对象表示理解你的忙碌','');}}}
        ]});
    }

    if(!G.hasCat&&chance(15)&&s>=1){
        pool.push({emoji:'🐱',title:'校园/小区的流浪猫',desc:'一只橘猫一直蹲在'+pick(['实验室门口','宿舍楼下','你的窗台'])+'\n它用大眼睛看着你...',
            choices:[
                {text:'收养它！取名Paper',icon:'🐱',effect:'幸福+18 压力-12',fn:function(){G.hasCat=true;mod({happy:18,stress:-12});addLog('Paper猫成了你的科研搭子','good');checkAch('cat','铲屎官','🐱');}},
                {text:'喂它一点吃的就走',icon:'🐟',effect:'幸福+3',fn:function(){mod({happy:3});addLog('猫猫吃饱了，朝你喵了一声','');}}
            ]
        });
    }

    if(G.hasCat&&chance(20)){
        pool.push({emoji:'🐱',title:'Paper猫又来捣乱',desc:pick([
            'Paper趴在你的键盘上打盹，论文进度为零。',
            'Paper把你的论文打印稿撕了...',
            '凌晨3点，Paper叫你起来给它喂粮。你顺便改了两页论文。',
            'Paper获得了实验室"荣誉成员"称号。'
        ]),choices:[
            {text:'算了，拍照发朋友圈',icon:'📸',effect:'幸福+8 人脉+3',fn:function(){mod({happy:8,social:3});addLog('猫片获赞100+','good');}},
            {text:'把猫从键盘上抱走',icon:'💪',effect:'智力+3',fn:function(){mod({intel:3});addLog('抱走Paper，继续干活','');}}
        ]});
    }

    // ===== 导师性格系统 (10) - 分配导师 =====
    if(s===4&&!G.mentorType&&chance(100)){
        var types=Object.keys(MENTOR_TYPES);
        pool.push({emoji:'👨‍🏫',title:'你的导师是...',
            desc:'研究生入学，最重要的事就是——你分到了什么样的导师？',
            choices:types.map(function(t){var m=MENTOR_TYPES[t];return{
                text:m.icon+' '+m.name,icon:m.icon,effect:m.desc,
                fn:function(){G.mentorType=t;addLog('你的导师是'+m.name+'（'+m.desc+'）','good');showFloat(m.icon+' '+m.name,'good');}
            };})
        });
    }

    // ===== 导师性格持续影响 =====
    if(G.mentorType&&s>=4&&s<=9&&chance(30)){
        var mt=MENTOR_TYPES[G.mentorType];
        if(G.mentorType==='push')pool.push({emoji:'😤',title:'导师又催了',desc:'"'+pick(['你的论文初稿什么时候给我？','组会你准备好了吗？','你这个月的工作量不够啊','隔壁组的学生都发了两篇了'])+'"',
            choices:[
                {text:'加班赶进度',icon:'💪',effect:'智力+8 压力+12',fn:function(){mod({intel:8,stress:12});addLog('被导师push后疯狂加班','');}},
                {text:'表面答应暗中摸鱼',icon:'🐟',effect:'幸福+5 压力+3',fn:function(){mod({happy:5,stress:3});addLog('"好的老师，在做了在做了"','');}}
            ]});
        if(G.mentorType==='free')pool.push({emoji:'🐑',title:'导师消失了',desc:'你已经一个月没见到导师了。邮件不回，微信已读不回。\n研究方向完全迷茫...',
            choices:[
                {text:'自己摸索方向',icon:'🔍',effect:'智力+12 压力+8',fn:function(){mod({intel:12,stress:8});addLog('独立思考能力大幅提升','good');G.traits.push('independent');}},
                {text:'找师兄师姐求助',icon:'🤝',effect:'人脉+10 智力+5',fn:function(){mod({social:10,intel:5});addLog('师兄带你入门了','good');}}
            ]});
        if(G.mentorType==='academic')pool.push({emoji:'🎓',title:'导师的高标准',desc:'"这个idea不够新颖，重新想。"\n你的方案第三次被否...',
            choices:[
                {text:'继续打磨，追求完美',icon:'💎',effect:'智力+15 压力+10',fn:function(){mod({intel:15,stress:10});if(chance(40)){addLog('在导师的严格要求下想出了绝妙idea','good');showFloat('💡 灵感爆发！','good');}else{addLog('还在改...','');}}},
                {text:'先做一个简单版本',icon:'📋',effect:'智力+5 压力-5',fn:function(){mod({intel:5,stress:-5});addLog('先把基础做好再说','');}}
            ]});
        if(G.mentorType==='industry')pool.push({emoji:'💰',title:'又一个横向项目',desc:'导师接了一个企业项目，让你去对接...\n跟科研关系不大，但有钱拿。',
            choices:[
                {text:'接！先赚钱再说',icon:'💰',effect:'积蓄+5万 人脉+8',fn:function(){G.money+=5;mod({social:8});addLog('横向项目赚了外快','good');}},
                {text:'跟导师商量减少横向',icon:'🗣️',effect:'压力+5 智力+5',fn:function(){mod({stress:5,intel:5});addLog('跟导师谈了之后，时间多了些做科研','');}}
            ]});
    }

    // ===== 专业专属事件 (1) - 每个学科独立支线 =====
    var cat=FIELD_CAT[G.field];
    if(s>=2&&chance(28)){
        // --- 信息科学 ---
        if(G.field==='CS')pool.push({emoji:'💻',title:'开源项目',desc:pick(['你写的一个工具库在GitHub上火了！','参加了Google Summer of Code','操作系统课的大作业写了个mini OS']),choices:[
            {text:'全力维护开源项目',icon:'🌟',effect:'声望+15 人脉+12',fn:function(){mod({fame:15,social:12});addLog('开源项目1000+ star！','good');checkAch('opensource','开源贡献者','💻');}},
            {text:'写进简历就行',icon:'📋',effect:'声望+5',fn:function(){mod({fame:5});addLog('简历又多了一项','');}}
        ]});
        if(G.field==='AI')pool.push({emoji:'🤖',title:'AI热潮',desc:pick(['ChatGPT横空出世，整个AI圈都炸了！','大模型时代来了，你之前的方法突然没人看了...','老板让你也搞大模型，可是GPU不够啊...','AI生成论文越来越强，你感到了危机...']),choices:[
            {text:'拥抱变化，转向大模型',icon:'🔥',effect:'智力+12 声望+10',fn:function(){mod({intel:12,fame:10});addLog('成功转型LLM方向','good');}},
            {text:'坚守自己的方向',icon:'🧱',effect:'智力+8',fn:function(){mod({intel:8});addLog('热潮会过去，基础研究永远有价值','');}}
        ]});
        if(G.field==='EE')pool.push({emoji:'⚡',title:'硬件噩梦',desc:pick(['焊了一周的板子烧了...','示波器波形跟仿真完全不一样','芯片缺货项目停滞','FPGA编译一次要3小时']),choices:[
            {text:'换个方案试试',icon:'🔧',effect:'智力+8 精力-10',fn:function(){mod({intel:8,energy:-10});addLog('工程师日常：换方案','');}},
            {text:'转软件方向算了',icon:'💻',effect:'智力+5 压力-5',fn:function(){mod({intel:5,stress:-5});addLog('硬件太难了，写代码吧','');}}
        ]});
        if(G.field==='Cyber')pool.push({emoji:'🔒',title:'网安事件',desc:pick(['发现了一个知名软件的0day漏洞！','CTF比赛打到全国前10','学校网站被攻击，你帮忙做了应急响应','某大厂的安全团队来招实习生']),choices:[
            {text:'提交漏洞/深入研究',icon:'🛡️',effect:'声望+15 智力+10',fn:function(){mod({fame:15,intel:10});addLog('在安全圈获得了名气','good');checkAch('hacker','白帽黑客','🔒');}},
            {text:'低调处理',icon:'🤫',effect:'智力+5',fn:function(){mod({intel:5});addLog('默默记录下来作为研究素材','');}}
        ]});

        // --- 工学 ---
        if(G.field==='Civil')pool.push({emoji:'🏗️',title:'工地实习',desc:pick(['导师要求你去工地实习三个月...烈日下搬砖的日子','混凝土配比实验做了30组','结构力学考试差点挂科','看到新闻说土木就业越来越难...']),choices:[
            {text:'坚持！土木人不怕苦',icon:'💪',effect:'精力-10 人脉+10 智力+5',fn:function(){mod({energy:-10,social:10,intel:5});addLog('工地实习让你更务实了','good');}},
            {text:'考虑转行/跨考',icon:'🔄',effect:'压力+10 智力+8',fn:function(){mod({stress:10,intel:8});addLog('开始思考是否要转行...','');}},
            {text:'往BIM/智能建造方向转',icon:'💻',effect:'智力+12 声望+5',fn:function(){mod({intel:12,fame:5});addLog('数字化转型是土木的未来','good');}}
        ]});
        if(G.field==='Mech')pool.push({emoji:'⚙️',title:'机械制图/加工',desc:pick(['三维建模做了一个月，渲染图很漂亮','数控加工的零件精度差了0.01mm','机器人大赛备赛中，天天泡在车间','有限元仿真跑了一周还没收敛']),choices:[
            {text:'精益求精',icon:'🔧',effect:'智力+10 精力-10',fn:function(){mod({intel:10,energy:-10});addLog('机械精度就是生命','good');}},
            {text:'差不多就行了',icon:'😅',effect:'幸福+5',fn:function(){mod({happy:5});addLog('公差范围内就行吧...','');}}
        ]});
        if(G.field==='Material')pool.push({emoji:'🧪',title:'材料表征',desc:pick(['XRD谱图解析不出来...','TEM排队排了两个月','合成的新材料性能不达标','隔壁课题组的材料性能碾压你的']),choices:[
            {text:'优化工艺参数，再试100次',icon:'🔬',effect:'智力+12 精力-15',fn:function(){mod({intel:12,energy:-15});if(chance(40)){G.papers++;addLog('终于合成出了理想材料！','good');playSound('good');}else{addLog('还在摸索中...','');}}},
            {text:'换一种材料体系',icon:'🔄',effect:'智力+5 压力-5',fn:function(){mod({intel:5,stress:-5});addLog('换个体系重新开始','');}}
        ]});
        if(G.field==='Energy')pool.push({emoji:'🔋',title:'能源政策风口',desc:pick(['国家发布新能源补贴政策，方向踩中风口！','碳中和推动虚拟电厂成热门','储能技术突破上了热搜']),choices:[
            {text:'紧跟政策热点',icon:'📈',effect:'声望+12 基金+10万',fn:function(){mod({fame:12});G.funding+=10;addLog('踩中政策风口！','good');}},
            {text:'专注基础研究',icon:'🔬',effect:'智力+10',fn:function(){mod({intel:10});addLog('基础研究才是根本','');}}
        ]});

        // --- 生化环材 ---
        if(G.field==='Bio')pool.push({emoji:'🧬',title:'生物实验室日常',desc:pick(['培养三个月的细胞被污染了...','PCR实验第15次失败','实验小鼠逃跑了3只','冰箱断电样本全废了','Western Blot跑出了鬼条带']),choices:[
            {text:'从头再来',icon:'💪',effect:'精力-15 压力+10 智力+5',fn:function(){mod({energy:-15,stress:10,intel:5});addLog('生物实验就是这样...重来吧','');}},
            {text:'先大哭一场再说',icon:'😭',effect:'压力-10 幸福-5',fn:function(){mod({stress:-10,happy:-5});addLog('哭完继续做实验','');}}
        ]});
        if(G.field==='Chem')pool.push({emoji:'⚗️',title:'化学实验室',desc:pick(['合成反应炸了！幸好穿了防护服','产率只有2%，导师让你提到20%','有机合成味道太大，回宿舍被室友嫌弃','在通风橱前站了8小时']),choices:[
            {text:'调整条件，继续合成',icon:'🧪',effect:'智力+10 精力-12',fn:function(){mod({intel:10,energy:-12});addLog('化学就是不断尝试的过程','');}},
            {text:'改用计算化学模拟',icon:'💻',effect:'智力+8 精力+5',fn:function(){mod({intel:8,energy:5});addLog('用DFT算一算再做实验','good');}}
        ]});
        if(G.field==='Env')pool.push({emoji:'🌿',title:'环境调研',desc:pick(['去某工厂采样，味道令人窒息...','水样分析数据异常，怀疑仪器出了问题','环保政策更新，研究方向需要调整','写环评报告写到天亮']),choices:[
            {text:'实地调研，拿到一手数据',icon:'🏭',effect:'智力+10 精力-10',fn:function(){mod({intel:10,energy:-10});addLog('拿到了宝贵的实地数据','good');}},
            {text:'用遥感数据代替',icon:'🛰️',effect:'智力+8',fn:function(){mod({intel:8});addLog('遥感+大数据是环境研究新趋势','');}}
        ]});

        // --- 理学 ---
        if(G.field==='Math')pool.push({emoji:'📐',title:'证明卡住了',desc:'一个定理的证明卡了两个月...\n草稿纸用了几百页，关键一步总是过不去。',choices:[
            {text:'换个思路',icon:'💡',effect:'智力+12',fn:function(){mod({intel:12});if(chance(30)){G.papers++;addLog('灵光一闪，证明完成了！','good');playSound('great');showFloat('📐 证明完成！','great');}else{addLog('新思路也卡住了...','');}}},
            {text:'找同行讨论',icon:'🤝',effect:'人脉+8 智力+5',fn:function(){mod({social:8,intel:5});addLog('讨论后有了新思路','good');}}
        ]});
        if(G.field==='Physics')pool.push({emoji:'⚛️',title:'物理实验/理论',desc:pick(['粒子对撞实验数据处理量惊人','量子计算的理论推导让你头秃','实验室的激光对准花了三天','凝聚态实验在2K低温下操作']),choices:[
            {text:'沉浸在物理的美中',icon:'✨',effect:'智力+15 幸福+5',fn:function(){mod({intel:15,happy:5});addLog('物理学的优雅让你着迷','good');}},
            {text:'想转去做计算物理',icon:'💻',effect:'智力+8 人脉+5',fn:function(){mod({intel:8,social:5});addLog('计算物理是新趋势','');}}
        ]});

        // --- 农学 ---
        if(G.field==='Agri')pool.push({emoji:'🌾',title:'田间实验',desc:pick(['水稻种了三个月，台风来了全倒了...','田间采样要在烈日下站一整天','转基因作物实验进展顺利','害虫防治的新方法效果显著']),choices:[
            {text:'重新播种，不怕从头来',icon:'🌱',effect:'精力-12 智力+8',fn:function(){mod({energy:-12,intel:8});addLog('农学人最不怕的就是重来','good');checkAch('farmer','田间科学家','🌾');}},
            {text:'改用温室/实验室模拟',icon:'🏠',effect:'智力+10',fn:function(){mod({intel:10});addLog('设施农业也是方向','');}}
        ]});
        if(G.field==='Food')pool.push({emoji:'🍎',title:'食品研发',desc:pick(['新配方的口感测试，要吃100份样品...','食品安全检测指标全部达标！','开发的新产品在展会上获好评','微生物发酵实验又失败了']),choices:[
            {text:'继续优化配方',icon:'👨‍🍳',effect:'智力+10 幸福+5',fn:function(){mod({intel:10,happy:5});addLog('美食+科学的完美结合','good');}},
            {text:'申请食品专利',icon:'📋',effect:'专利+1 声望+5',fn:function(){G.patents++;mod({fame:5});addLog('拿到食品专利！','good');}}
        ]});

        // --- 医学 ---
        if(G.field==='Med')pool.push({emoji:'🏥',title:'临床+科研',desc:pick(['白天值班晚上做科研，每天只睡4小时','临床病例启发了一个新研究方向','SCI论文和住院医规培同时进行','手术观摩学到了很多但没时间写论文']),choices:[
            {text:'临床科研两手抓',icon:'💪',effect:'智力+12 精力-18 压力+12',fn:function(){mod({intel:12,energy:-18,stress:12});addLog('医学生的日常：永远在忙','');checkAch('doctor','医学战士','🏥');}},
            {text:'先把临床做好',icon:'🩺',effect:'人脉+10 幸福+5',fn:function(){mod({social:10,happy:5});addLog('患者的感谢让你觉得一切值得','good');}}
        ]});
        if(G.field==='Pharm')pool.push({emoji:'💊',title:'药物研发',desc:pick(['新药候选分子活性很好！','动物实验结果不理想，回到起点','药企合作机会来了','药物合成路线需要重新设计']),choices:[
            {text:'推进临床前研究',icon:'🔬',effect:'智力+12 声望+8',fn:function(){mod({intel:12,fame:8});if(chance(25)){G.patents++;addLog('新药专利申请成功！','good');playSound('great');checkAch('pharma','新药发现者','💊');}else{addLog('研究在推进中','');}}},
            {text:'和药企合作开发',icon:'🏭',effect:'基金+15万 人脉+10',fn:function(){G.funding+=15;mod({social:10});addLog('产学研合作启动','good');}}
        ]});

        // --- 人文社科 ---
        if(G.field==='Econ')pool.push({emoji:'📊',title:'经济学研究',desc:pick(['计量模型跑了一周，结果不显著...','找到了一个绝佳的自然实验场景','审稿人说你的因果识别有问题','央行政策变了，论文要重写']),choices:[
            {text:'换模型/换数据重做',icon:'📈',effect:'智力+10 压力+8',fn:function(){mod({intel:10,stress:8});addLog('经济学就是跟数据死磕','');}},
            {text:'加入政策研究团队',icon:'🏛️',effect:'人脉+12 声望+8',fn:function(){mod({social:12,fame:8});addLog('政策咨询项目提升了影响力','good');}}
        ]});
        if(G.field==='Law')pool.push({emoji:'⚖️',title:'法学研究',desc:pick(['新的司法解释出来了，论文观点要修改','模拟法庭比赛获奖','去法院实习体验了真实案件','法条背了一万条，脑子快炸了']),choices:[
            {text:'深耕某个法律分支',icon:'📚',effect:'智力+12 声望+8',fn:function(){mod({intel:12,fame:8});addLog('成为了某领域的法律专家','good');}},
            {text:'跨学科：法律+科技',icon:'💻',effect:'智力+10 人脉+8',fn:function(){mod({intel:10,social:8});addLog('科技法/AI伦理是新蓝海','good');}}
        ]});
        if(G.field==='Edu')pool.push({emoji:'📖',title:'教育研究',desc:pick(['课堂观察记录做了一学期','问卷调查回收率只有15%...','教育政策改革为研究提供了新课题','去偏远学校支教一个月']),choices:[
            {text:'扎根一线做田野研究',icon:'🏫',effect:'智力+10 幸福+10',fn:function(){mod({intel:10,happy:10});addLog('教育研究需要脚踏实地','good');checkAch('educator','教育情怀','📖');}},
            {text:'用大数据分析教育问题',icon:'📊',effect:'智力+12 声望+5',fn:function(){mod({intel:12,fame:5});addLog('教育+AI是未来方向','good');}}
        ]});
        if(G.field==='Psych')pool.push({emoji:'🧠',title:'心理学实验',desc:pick(['EEG实验被试迟到了，一下午白等','问卷数据统计发现了有趣的相关性','认知实验的范式设计获得导师表扬','被试量不够，在校园里到处拉人']),choices:[
            {text:'严格设计实验，追求可重复性',icon:'🔬',effect:'智力+12 声望+8',fn:function(){mod({intel:12,fame:8});addLog('严谨的实验设计是心理学的生命','good');}},
            {text:'用计算建模替代部分实验',icon:'💻',effect:'智力+10',fn:function(){mod({intel:10});addLog('计算心理学越来越火','');}}
        ]});

        // --- 艺术 ---
        if(G.field==='Art')pool.push({emoji:'🎨',title:'艺术创作与学术',desc:pick(['毕业设计作品在展览上获了奖','导师说你的设计缺乏理论深度','作品被某品牌看中想要合作','写学术论文对艺术生来说太痛苦了...']),choices:[
            {text:'用作品说话',icon:'🖌️',effect:'声望+15 幸福+10',fn:function(){mod({fame:15,happy:10});addLog('好的设计自己会说话','good');checkAch('artist','艺术家','🎨');}},
            {text:'恶补学术写作',icon:'📝',effect:'智力+10 压力+8',fn:function(){mod({intel:10,stress:8});addLog('论文写作是艺术生的噩梦...','');}}
        ]});
        if(G.field==='Music')pool.push({emoji:'🎵',title:'音乐学术',desc:pick(['作曲的新作品获得教授好评','音乐分析论文写了三个月','去音乐厅听了一场改变人生的演出','练琴练到手指起泡']),choices:[
            {text:'创作+学术双轨发展',icon:'🎹',effect:'智力+10 幸福+12',fn:function(){mod({intel:10,happy:12});addLog('音乐让灵魂自由','good');checkAch('musician','音乐人','🎵');}},
            {text:'专注音乐技术研究',icon:'🔬',effect:'智力+12 声望+5',fn:function(){mod({intel:12,fame:5});addLog('音频AI/计算音乐学是跨学科方向','');}}
        ]});
        if(G.field==='Film')pool.push({emoji:'🎬',title:'影视创作',desc:pick(['短片获得了校园电影节最佳导演','拍摄经费不够，自掏腰包补上','在某平台发布的视频意外走红了','论文被要求分析100部电影...']),choices:[
            {text:'用影像记录世界',icon:'📹',effect:'声望+12 人脉+10 幸福+8',fn:function(){mod({fame:12,social:10,happy:8});addLog('好的影像作品有改变世界的力量','good');checkAch('filmmaker','影像创作者','🎬');}},
            {text:'深入影视理论研究',icon:'📚',effect:'智力+12',fn:function(){mod({intel:12});addLog('理论是创作的根基','');}}
        ]});
    }

    // ===== 决策因果链 (2) =====
    if(G.traits.indexOf('early_research')>=0&&s===4&&chance(60)){
        pool.push({emoji:'🌟',title:'本科导师推荐信',desc:'你大一就进实验室的经历发挥了作用！\n本科导师写了一封强推荐信，新导师对你另眼相看。',
            choices:[{text:'感恩前行',icon:'🙏',effect:'声望+12 人脉+10',fn:function(){mod({fame:12,social:10});addLog('本科的积累终于回报了！','good');checkAch('butterfly','蝴蝶效应','🦋');}}]
        });
    }
    if(G.traits.indexOf('gamer')>=0&&s>=4&&chance(20)){
        pool.push({emoji:'🎮',title:'游戏技能意外派上用场',desc:'你在' + pick(['强化学习项目中用上了游戏策略思维','做用户研究时对游戏化设计侃侃而谈','团队合作中展现了打游戏练出的指挥能力']) + '。',
            choices:[{text:'哈哈，没白玩',icon:'😎',effect:'智力+8 幸福+8',fn:function(){mod({intel:8,happy:8});addLog('大一打游戏的时光没白费','good');}}]
        });
    }
    if(G.traits.indexOf('social_butterfly')>=0&&s>=6&&chance(25)){
        pool.push({emoji:'🤝',title:'人脉带来的机会',desc:'一个大二认识的学长现在在'+pick(['Google','微软','清华','MIT'])+'，他给你介绍了一个绝佳的合作机会。',
            choices:[{text:'感谢大二的自己！',icon:'🌟',effect:'声望+15 人脉+10',fn:function(){mod({fame:15,social:10});addLog('多年前建立的人脉发挥了作用！','good');checkAch('butterfly','蝴蝶效应','🦋');}}]
        });
    }
    if(G.traits.indexOf('independent')>=0&&s>=10&&chance(30)){
        pool.push({emoji:'💡',title:'独立思考的回报',desc:'因为导师放羊逼出来的独立研究能力，你比同龄人更快建立了自己的研究方向。',
            choices:[{text:'感谢当年的困境',icon:'💪',effect:'声望+12 智力+8',fn:function(){mod({fame:12,intel:8});addLog('独立能力成了你最大的优势','good');}}]
        });
    }

    // ===== 学术不端抉择 (9) =====
    if(s>=5&&s<=12&&chance(15)){
        var ethicsEvents=[
            {emoji:'⚖️',title:'灌水的诱惑',desc:'师兄建议把一篇论文拆成三篇发，数据换个角度就行。\n"大家都这么干的。"',
                choices:[
                    {text:'拒绝，坚持学术标准',icon:'✊',effect:'智力+5 声望+8',fn:function(){mod({intel:5,fame:8});addLog('拒绝灌水，坚守底线','good');checkAch('integrity','学术诚信','⚖️');}},
                    {text:'那就拆吧...生存第一',icon:'📄',effect:'论文+2 压力+5',fn:function(){G.papers+=2;mod({stress:5,fame:-5});addLog('拆了论文...心里有点不安','');}}
                ]},
            {emoji:'⚖️',title:'挂名请求',desc:'一个不认识的教授找你导师，想在你的论文上挂个名字。\n导师说"人家给了我们经费，加上吧。"',
                choices:[
                    {text:'听导师的，加上名字',icon:'🤝',effect:'基金+5万 人脉+5',fn:function(){G.funding+=5;mod({social:5});addLog('加了挂名...学术界的潜规则','');}},
                    {text:'委婉拒绝，作者应该有贡献',icon:'✊',effect:'声望+10 压力+8',fn:function(){mod({fame:10,stress:8});addLog('坚持了作者贡献原则','good');checkAch('integrity','学术诚信','⚖️');}}
                ]},
            {emoji:'⚖️',title:'数据的诱惑',desc:'实验结果离发表还差一点点...如果把那几个异常值去掉，结果就完美了。\n"没人会发现的。"',
                choices:[
                    {text:'如实报告，包括异常值',icon:'✊',effect:'智力+8 声望+10',fn:function(){mod({intel:8,fame:10});addLog('如实报告数据，科学的底线不能破','good');checkAch('integrity','学术诚信','⚖️');}},
                    {text:'去掉异常值，没人会查的',icon:'📊',effect:'论文+1 压力+10',fn:function(){G.papers++;mod({stress:10,happy:-5});if(chance(15)){mod({fame:-20,stress:20});addLog('数据造假被查出来了！声誉受损！','bad');playSound('bad');showFloat('⚠️ 学术不端！','bad');}else{addLog('论文发了...但心里一直不安','');}}}
                ]}
        ];
        pool.push(pick(ethicsEvents));
    }

    // 压力过高
    if(G.stress>=78&&G.energy<=30&&chance(65)){
        pool.push({emoji:'⚠️',title:'身体亮红灯',
            desc:'连续高压工作导致你'+pick(['严重失眠，凌晨4点还睡不着','突发性头痛，持续了一周','焦虑到手抖，无法打字','体检报告一堆异常指标'])+'...\n\n'+pick(MEMES.life),
            choices:[
                {text:'停下来，休息一段时间',icon:'🛌',effect:'精力+30 压力-30 幸福+10',fn:function(){mod({energy:30,stress:-30,happy:10});addLog('强制休息了一个月，身体慢慢恢复','good');checkAch('selfcare','爱惜身体','🩺');}},
                {text:'吃药继续干',icon:'💊',effect:'精力-10 压力+10',fn:function(){mod({energy:-10,stress:10,happy:-15});G.burnout=true;addLog('硬撑着...但代价是什么？','bad');playSound('bad');}}
            ]
        });
    }

    // 随机好事
    if(chance(20)&&s>=3){
        pool.push({emoji:'🎲',title:pick(['意外之喜','好运降临','惊喜来了']),
            desc:pick([
                '你的一篇旧论文突然被Nature综述引用了！引用量飙升。',
                '审稿人居然给了Accept without revision！这是什么神仙运气！',
                '你在学术会议上做完报告，一位大佬主动来加微信。',
                '一个海外教授发邮件想跟你合作！',
                '学校突然发了一笔科研奖励。'
            ]),
            choices:[
                {text:'感恩！继续努力',icon:'🙏',effect:'声望+12 幸福+10',fn:function(){mod({fame:12,happy:10});addLog(pick(MEMES.success),'good');playSound('good');}}
            ]
        });
    }

    return pool.length>0?pick(pool):null;
}

// ==================== Game Flow ====================
function startGame(){
    G.name=document.getElementById('playerName').value.trim()||'科研小白';
    G.field=document.getElementById('playerField').value;
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    addLog('【'+G.name+'】进入'+FIELD_NAMES[G.field]+'专业，人生旅程开始！','good');
    playSound('great');
    nextTurn();
}

function nextTurn(){
    G.turnCount++;
    if(G.stage>=14||G.year>=2065||(G.energy<=0&&G.stress>=90)){endGame();return;}
    if(!G.hasMaster&&G.stage>=5&&!G.hasJob&&!G.hasPhd){endGame();return;}

    if(G.turnCount>1){
        G.year++;G.age++;
        if(G.stage<=3){G.stage++;}
        else if(G.stage>=4&&G.stage<=5){if(G.substage>=1){G.stage++;G.substage=0;}else G.substage++;}
        else if(G.stage===6){if(G.hasPhd){G.stage=7;G.substage=0;}else if(!G.hasPhd&&G.hasMaster){/* stay or end */}else G.substage++;}
        else if(G.stage>=7&&G.stage<=8&&G.hasPhd){if(G.substage>=1){G.stage++;G.substage=0;}else G.substage++;}
        else if(G.stage===9){G.stage=10;checkAch('phd','博士毕业','🎓');addLog('博士毕业！','good');playSound('great');}
        else if(G.stage===10){if(G.substage>=1){G.stage=11;G.substage=0;addLog('入职高校！','good');}else G.substage++;}
        else if(G.stage===11){if(G.papers>=10&&G.fame>=35&&G.substage>=2){G.stage=12;G.substage=0;addLog('评上副教授！','good');checkAch('assoc_prof','副教授','👨‍🏫');playSound('great');showFloat('🎉 副教授！','great');}else G.substage++;}
        else if(G.stage===12){if(G.topPapers>=4&&G.fame>=60&&G.funding>=60&&G.substage>=2){G.stage=13;G.substage=0;addLog('晋升教授！','good');checkAch('professor','教授','🏅');playSound('great');showFloat('🎓 教授！！','great');}else G.substage++;}
        else if(G.stage===13){if(G.fame>=90&&G.topPapers>=7&&G.substage>=2){G.stage=14;}else G.substage++;}
        else G.substage++;
    }

    // Natural changes
    mod({energy:rand(-3,5),stress:rand(-2,4)});
    if(G.partner)mod({happy:2,stress:-2});
    if(G.burnout)mod({energy:-5,happy:-3});
    if(G.hasCat)mod({happy:2,stress:-1});
    if(G.age>=35)mod({energy:-1});
    if(G.age>=45)mod({energy:-1});
    // Mentor natural effects (10)
    if(G.mentorType){
        var mt=MENTOR_TYPES[G.mentorType];
        if(mt.stressMod)mod({stress:mt.stressMod});
        if(mt.intelMod)mod({intel:mt.intelMod});
        if(mt.happyMod)mod({happy:mt.happyMod});
        if(mt.fameMod)mod({fame:mt.fameMod});
        if(mt.moneyMod)G.money+=mt.moneyMod;
    }

    // Year summary (3) - show every 3 turns after stage 4
    if(G.turnCount>1&&G.turnCount%3===0&&G.stage>=4){
        var summary=[];
        summary.push('📄 论文: '+G.papers+' 篇 (顶刊 '+G.topPapers+')');
        summary.push('💰 经费: '+G.funding+'万 | 积蓄: '+G.money+'万');
        summary.push('😊 幸福: '+G.happy+' | 😰 压力: '+G.stress);
        if(G.partner)summary.push('❤️ 恋爱中');
        if(G.hasCat)summary.push('🐱 Paper猫陪伴中');
        if(G.mentorType)summary.push(MENTOR_TYPES[G.mentorType].icon+' '+MENTOR_TYPES[G.mentorType].name);
        G.yearSummary=summary;
        setTimeout(showYearSummary,100);
    }

    // Celebration for major milestones (8)
    if(G.stage===12&&G.substage===0&&G.turnCount>1)showCelebration('👨‍🏫','评上副教授了！');
    if(G.stage===13&&G.substage===0&&G.turnCount>1)showCelebration('🏅','晋升教授！！！');
    if(G.stage===14)showCelebration('👑','杰出学者！学术巅峰！');

    updateUI();
    showEvent(getEvents());
}

function showEvent(ev){
    if(!ev){nextTurn();return;}
    document.getElementById('eventEmoji').textContent=ev.emoji;
    document.getElementById('eventTitle').textContent=ev.title;
    // Typewriter effect (7)
    typeWrite(document.getElementById('eventDesc'),ev.desc);
    var el=document.getElementById('choices');
    el.innerHTML='';
    ev.choices.forEach(function(c){
        var btn=document.createElement('button');
        btn.className='choice-btn';
        btn.innerHTML='<span class="choice-icon">'+c.icon+'</span><div><div class="choice-text">'+c.text+'</div><div class="choice-effect">'+c.effect+'</div></div>';
        btn.onclick=function(){
            playSound('click');
            c.fn();
            animateStatChanges();
            updateUI();
            setTimeout(nextTurn,400);
        };
        el.appendChild(btn);
    });
    document.getElementById('eventCard').style.animation='none';
    requestAnimationFrame(function(){document.getElementById('eventCard').style.animation='cardIn 0.5s cubic-bezier(.4,0,.2,1)';});
}

function animateStatChanges(){
    var checks=[['statPapers',G.papers,prevStats.papers],['statTop',G.topPapers,prevStats.topPapers],['statMoney',G.money,prevStats.money]];
    checks.forEach(function(c){
        var el=document.getElementById(c[0]);
        if(el&&c[1]!==c[2]){
            el.classList.add(c[1]>c[2]?'up':'down');
            setTimeout(function(){el.classList.remove('up','down');},600);
        }
    });
    // Shake on bad events
    if(G.stress>prevStats.stress+15||G.energy<prevStats.energy-15){
        document.getElementById('gameMain').classList.add('shake');
        setTimeout(function(){document.getElementById('gameMain').classList.remove('shake');},500);
    }
}

function updateUI(){
    document.getElementById('statYear').textContent=G.year;
    document.getElementById('statPapers').textContent=G.papers;
    document.getElementById('statTop').textContent=G.topPapers;
    document.getElementById('statMoney').textContent=G.money+'万';
    document.getElementById('timelineAge').textContent=G.age+'岁';
    document.getElementById('timelineStage').textContent=STAGES[Math.min(G.stage,14)]||'社会人';
    document.getElementById('timelineFill').style.width=Math.min(100,G.stage/14*100)+'%';
    [['Intel',G.intel],['Energy',G.energy],['Social',G.social],['Stress',G.stress],['Fame',G.fame],['Happy',G.happy]].forEach(function(b){
        var bar=document.getElementById('bar'+b[0]),num=document.getElementById('stat'+b[0]);
        if(bar)bar.style.width=b[1]+'%';
        if(num)num.textContent=b[1];
    });
}

function toggleLog(){
    var c=document.getElementById('logContent');c.classList.toggle('open');
    document.getElementById('logToggleIcon').textContent=c.classList.contains('open')?'▲':'▼';
    c.innerHTML=G.log.slice().reverse().map(function(l){return'<div class="log-item"><span class="log-year">['+l.year+']</span> <span class="log-'+l.type+'">'+l.text+'</span></div>';}).join('');
}

// ==================== End & Share ====================
function endGame(){
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('endScreen').classList.add('active');

    var title,desc,quote;
    if(G.stage>=14){title='学术泰斗';desc='你攀登到了学术的最高峰。无数论文、基金和学生见证了你的传奇人生。';quote='"科学的进步需要一代代人的坚持。你，就是其中最闪耀的一颗星。"';}
    else if(G.stage>=13){title='知名教授';desc='你是'+FIELD_NAMES[G.field]+'领域的知名教授，影响了整个行业。';quote='"不是所有人都能成为院士，但每一位教授都在推动文明前进。"';}
    else if(G.stage>=12){title='副教授';desc='稳步前行的学者，教授之路指日可待。';quote='"学术的马拉松，你已经跑过了大半程。"';}
    else if(G.stage>=11){title='高校讲师';desc='教书育人，平凡而伟大。';quote='"三尺讲台，方寸之间，你点亮了无数学生的未来。"';}
    else if(G.stage>=9){title='科研探索者';desc='在科研路上孜孜不倦。';quote='"科研就像在黑暗中摸索，但你从未放弃手中的火把。"';}
    else if(G.money>=80){title='财富自由';desc='离开学术圈闯出了一片天。';quote='"不是只有论文才能证明价值。"';}
    else if(G.hasStartup){title='创业者';desc='创业是另一种形式的科研。';quote='"把论文写在产品上。"';}
    else if(G.happy>=85){title='幸福大师';desc='活出了自己最想要的样子。';quote='"人生最大的成就，是你自己觉得幸福。"';}
    else if(G.partner&&G.happy>=65){title='人生赢家';desc='事业与生活完美平衡。';quote='"最好的人生，不是最成功的，而是最平衡的。"';}
    else{title='真实人生';desc='有遗憾有收获，这就是人生。';quote='"每一个选择都塑造了独一无二的你。"';}

    document.getElementById('endCard').innerHTML='<h3>'+G.name+'</h3><div class="end-title-badge">'+title+'</div><p class="end-desc">'+desc+'</p><p class="end-quote">'+quote+'</p><p style="margin-top:0.8rem;font-size:0.8rem;color:#555">'+FIELD_NAMES[G.field]+' · '+G.year+'年 · '+G.age+'岁</p>';

    var score=G.papers*10+G.topPapers*50+G.fame*2+G.funding/5+G.students*3+Math.round(G.happy*0.8)+G.achievements.length*20+G.patents*15;
    score=Math.round(score);
    var pct=Math.min(99,Math.round(50+score/15));
    document.getElementById('endScore').innerHTML='<div class="end-score-label">综合评分</div><div class="end-score-num">'+score+'</div><div class="end-percentile">超过了 '+pct+'% 的玩家</div>';

    document.getElementById('endStats').innerHTML=[
        ['📄',G.papers,'论文'],['⭐',G.topPapers,'顶刊/顶会'],['💰',G.funding+'万','科研经费'],
        ['👨‍🎓',G.students,'培养学生'],['⚙️',G.patents,'专利'],['💵',G.money+'万','个人积蓄']
    ].map(function(s){return'<div class="end-stat"><div class="end-stat-num">'+s[0]+' '+s[1]+'</div><div class="end-stat-label">'+s[2]+'</div></div>';}).join('');

    var ah='<h4>🏅 成就 ('+G.achievements.length+'/30)</h4>';
    if(!G.achievements.length)ah+='<p style="color:#444;font-size:0.82rem">暂无成就，再来一次吧！</p>';
    G.achievements.forEach(function(a){ah+='<div class="achievement"><span class="ach-icon">'+a.icon+'</span> '+a.name+'</div>';});
    document.getElementById('endAchievements').innerHTML=ah;

    // Leaderboard
    saveScore(score,title);
    renderLeaderboard();

    playSound('great');
}

function saveScore(score,title){
    try{
        var lb=JSON.parse(localStorage.getItem('rl_leaderboard')||'[]');
        lb.push({name:G.name,score:score,title:title,field:G.field,year:G.year,date:new Date().toLocaleDateString()});
        lb.sort(function(a,b){return b.score-a.score;});
        lb=lb.slice(0,10);
        localStorage.setItem('rl_leaderboard',JSON.stringify(lb));
    }catch(e){}
}

function renderLeaderboard(){
    try{
        var lb=JSON.parse(localStorage.getItem('rl_leaderboard')||'[]');
        if(!lb.length)return;
        var h='<h4>🏆 排行榜</h4>';
        lb.forEach(function(e,i){
            var isCurrent=e.name===G.name&&e.score===Math.round(G.papers*10+G.topPapers*50+G.fame*2+G.funding/5+G.students*3+Math.round(G.happy*0.8)+G.achievements.length*20+G.patents*15);
            h+='<div class="lb-item'+(isCurrent?' current':'')+'"><span>#'+(i+1)+' '+e.name+' ('+e.title+')</span><span>'+e.score+'分</span></div>';
        });
        document.getElementById('endLeaderboard').innerHTML=h;
    }catch(e){}
}

function shareResult(){
    var canvas=document.getElementById('shareCanvas');
    var ctx=canvas.getContext('2d');
    var w=600,h=800;
    // Background
    var grd=ctx.createLinearGradient(0,0,w,h);
    grd.addColorStop(0,'#0f0f23');grd.addColorStop(0.5,'#1a1a3e');grd.addColorStop(1,'#0f0f23');
    ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
    // Title
    ctx.fillStyle='#667eea';ctx.font='bold 36px sans-serif';ctx.textAlign='center';
    ctx.fillText('科研人生模拟器',w/2,60);
    ctx.fillStyle='#888';ctx.font='16px sans-serif';ctx.fillText('Research Life Simulator',w/2,85);
    // Divider
    ctx.strokeStyle='#2a2a5a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(50,110);ctx.lineTo(550,110);ctx.stroke();
    // Name & Title
    ctx.fillStyle='#fff';ctx.font='bold 28px sans-serif';ctx.fillText(G.name,w/2,160);
    ctx.fillStyle='#f093fb';ctx.font='20px sans-serif';
    var title=document.querySelector('.end-title-badge');
    ctx.fillText(title?title.textContent:'',w/2,195);
    // Stats
    var stats=[['论文 '+G.papers,'顶刊 '+G.topPapers,'经费 '+G.funding+'万'],['学生 '+G.students,'专利 '+G.patents,'积蓄 '+G.money+'万']];
    ctx.font='18px sans-serif';ctx.fillStyle='#aaa';
    stats.forEach(function(row,ri){
        row.forEach(function(s,ci){
            ctx.fillText(s,100+ci*200,260+ri*40);
        });
    });
    // Score
    var score=Math.round(G.papers*10+G.topPapers*50+G.fame*2+G.funding/5+G.students*3+Math.round(G.happy*0.8)+G.achievements.length*20+G.patents*15);
    ctx.fillStyle='#667eea';ctx.font='bold 60px sans-serif';ctx.fillText(score,w/2,420);
    ctx.fillStyle='#888';ctx.font='16px sans-serif';ctx.fillText('综合评分',w/2,450);
    // Achievements
    ctx.fillStyle='#666';ctx.font='14px sans-serif';ctx.fillText('成就 '+G.achievements.length+'/30',w/2,500);
    var achText=G.achievements.map(function(a){return a.icon+' '+a.name;}).join('  ');
    ctx.fillStyle='#888';ctx.font='13px sans-serif';
    if(achText.length>50)achText=achText.substring(0,50)+'...';
    ctx.fillText(achText||'暂无成就',w/2,525);
    // Footer
    ctx.fillStyle='#444';ctx.font='13px sans-serif';
    ctx.fillText('startrungo.github.io/research-tools/game/',w/2,750);
    ctx.fillText('扫码来测测你的科研人生！',w/2,775);

    // Download
    var link=document.createElement('a');
    link.download='我的科研人生-'+G.name+'.png';
    link.href=canvas.toDataURL('image/png');
    link.click();
}

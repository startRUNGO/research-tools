// ==================== Research Life Simulator v2 ====================
// 科研人生模拟器 - 爆款升级版

var G = {
    name:'', field:'', year:2020, age:18,
    stage:0, substage:0,
    intel:50, energy:100, social:20, stress:10, fame:0, happy:80,
    papers:0, topPapers:0, patents:0, money:0, funding:0,
    students:0, awards:0, teaching:0,
    gpa:3.0, hasPhd:false, hasMaster:false, isAbroad:false,
    mentor:'', partner:false, burnout:false, hasJob:false,
    hasCat:false, hasStartup:false, reviewer:false, phdYears:0,
    traits:[], // earned traits that affect future events
    log:[], achievements:[], turnCount:0
};

var STAGES=['大一新生','大二','大三','大四','研一','研二','研三/博一','博二','博三','博四','博士后','讲师','副教授','教授','杰出学者'];
var FIELD_NAMES={CS:'计算机',EE:'电子工程',AI:'人工智能',Energy:'新能源',Bio:'生物医学',Math:'数学'};

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

    updateUI();
    showEvent(getEvents());
}

function showEvent(ev){
    if(!ev){nextTurn();return;}
    document.getElementById('eventEmoji').textContent=ev.emoji;
    document.getElementById('eventTitle').textContent=ev.title;
    document.getElementById('eventDesc').textContent=ev.desc;
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

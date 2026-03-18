// ==================== Research Life Simulator ====================

var G = {
    name: '', field: '', year: 2020, age: 18,
    stage: 0, substage: 0,
    intel: 50, energy: 100, social: 20, stress: 10, fame: 0, happy: 80,
    papers: 0, topPapers: 0, patents: 0, money: 0, funding: 0,
    students: 0, awards: 0, teaching: 0,
    gpa: 3.0, hasPhd: false, hasMaster: false, isAbroad: false,
    mentor: '', partner: false, burnout: false, hasJob: false,
    log: [], achievements: [], turnCount: 0, usedEvents: {}
};

var STAGES = ['大一新生','大二','大三','大四','研一','研二','研三/博一','博二','博三','博四','博士后','讲师','副教授','教授','杰出学者'];

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function chance(pct) { return Math.random() * 100 < pct; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }

function mod(changes) {
    var statKeys = ['intel','energy','social','stress','fame','happy'];
    var countKeys = ['papers','topPapers','money','funding','patents','students','awards','teaching'];
    Object.keys(changes).forEach(function(k) {
        if (statKeys.indexOf(k) >= 0) G[k] = clamp(G[k] + changes[k], 0, 100);
        if (countKeys.indexOf(k) >= 0) G[k] = Math.max(0, G[k] + changes[k]);
    });
}

function addLog(text, type) { G.log.push({ year: G.year, text: text, type: type || '' }); }

function checkAch(id, name, icon) {
    if (G.achievements.find(function(a) { return a.id === id; })) return;
    G.achievements.push({ id: id, name: name, icon: icon });
    addLog('🏅 解锁成就: ' + name, 'good');
}

function useEvent(id) { G.usedEvents[id] = true; return !G.usedEvents[id + '_done']; }
function doneEvent(id) { G.usedEvents[id + '_done'] = true; }

// ==================== Events Database ====================
function getEvents() {
    var s = G.stage;
    var pool = [];

    // ========== 大一 (0) ==========
    if (s === 0) {
        pool.push({
            emoji: '🎒', title: '大一: 开学季',
            desc: '怀着对未来的期待，你走进了' + G.field + '专业的课堂。大学生活该怎么开始呢？',
            choices: [
                { text: '认真听课，泡图书馆', icon: '📚', effect: '智力+15 精力-10 GPA↑', fn: function() { mod({intel:15,energy:-10}); G.gpa=3.6; addLog('大一勤奋学习，期末GPA 3.6','good'); }},
                { text: '加入各种社团', icon: '🎭', effect: '人脉+20 幸福+10', fn: function() { mod({social:20,happy:10,intel:3}); addLog('加入了辩论队、科协、学生会','good'); }},
                { text: '和室友一起打游戏', icon: '🎮', effect: '幸福+15 精力+10 智力-5', fn: function() { mod({happy:15,energy:10,intel:-5}); G.gpa=2.8; addLog('通宵打游戏，考试差点挂科',''); }},
                { text: '找学长打听，进实验室', icon: '🔬', effect: '智力+20 声望+5 精力-15', fn: function() { mod({intel:20,fame:5,energy:-15}); G.mentor='本科导师'; addLog('大一就进了教授实验室！','good'); }}
            ]
        });
        if (chance(40)) {
            pool.push({ emoji: '🎉', title: '新生晚会', desc: '学院组织新生晚会，你要参加吗？',
                choices: [
                    { text: '上台表演才艺', icon: '🎤', effect: '人脉+15 幸福+10', fn: function() { mod({social:15,happy:10}); addLog('晚会表演获得满堂彩','good'); }},
                    { text: '在台下做志愿者', icon: '🤝', effect: '人脉+10', fn: function() { mod({social:10}); addLog('认识了很多新朋友',''); }},
                    { text: '回宿舍学习', icon: '📖', effect: '智力+5', fn: function() { mod({intel:5}); addLog('安静地看了一晚上书',''); }}
                ]
            });
        }
        if (chance(30)) {
            pool.push({ emoji: '💻', title: '编程启蒙', desc: '第一次接触编程课，C语言让很多同学崩溃...',
                choices: [
                    { text: '花大量时间练习编程', icon: '⌨️', effect: '智力+15 精力-10', fn: function() { mod({intel:15,energy:-10}); addLog('掌握了编程基础，写出了第一个程序！','good'); checkAch('code','代码初心','💻'); }},
                    { text: '抄室友的作业', icon: '📋', effect: '幸福+5 智力-5', fn: function() { mod({happy:5,intel:-5}); addLog('蒙混过关了...但什么也没学到',''); }}
                ]
            });
        }
    }

    // ========== 大二 (1) ==========
    if (s === 1) {
        pool.push({
            emoji: '📖', title: '大二: 专业深入',
            desc: '专业课难度骤增，数据结构、概率论...每天都在肝作业。',
            choices: [
                { text: '组队参加竞赛（ACM/数模）', icon: '🏆', effect: '智力+12 声望+10 精力-10', fn: function() { mod({intel:12,fame:10,energy:-10}); if(chance(55)){G.awards++;addLog('竞赛获奖！简历+1','good');checkAch('contest','竞赛达人','🏅');}else{addLog('没获奖，但锻炼了能力','');}}},
                { text: '找教授做科研项目', icon: '🔬', effect: '智力+15 声望+8', fn: function() { mod({intel:15,fame:8}); G.mentor=G.mentor||'科研导师'; addLog('参加了SRTP大创项目','good'); }},
                { text: '暑假去大厂实习', icon: '💼', effect: '积蓄+3万 人脉+15', fn: function() { G.money+=3; mod({social:15,intel:5}); addLog('暑假在字节跳动/华为实习','good'); }},
                { text: '学第二外语/考证', icon: '📝', effect: '智力+8 人脉+5', fn: function() { mod({intel:8,social:5}); addLog('考过了六级/雅思','good'); }}
            ]
        });
        if (chance(35)) {
            pool.push({ emoji: '❤️', title: '校园恋爱', desc: '在' + pick(['图书馆','实验室','食堂','社团活动']) + '遇到了让你心动的人...',
                choices: [
                    { text: '大胆表白！', icon: '💌', effect: '幸福±?', fn: function() { if(chance(50)){G.partner=true;mod({happy:20,social:5});addLog('恋爱了！幸福感爆棚','good');checkAch('love','恋爱中','❤️');}else{mod({happy:-10});addLog('被拒绝了...难过了一星期','bad');}}},
                    { text: '先做朋友', icon: '🤝', effect: '人脉+10', fn: function() { mod({social:10,happy:5}); addLog('多了一个好朋友',''); }},
                    { text: '专注学业', icon: '📚', effect: '智力+5', fn: function() { mod({intel:5}); addLog('把心思放在了学习上',''); }}
                ]
            });
        }
        if (chance(30)) {
            pool.push({ emoji: '😷', title: '生了一场病', desc: '连续熬夜导致你病倒了，在宿舍躺了一周...',
                choices: [
                    { text: '好好休息恢复', icon: '🛌', effect: '精力+20 幸福+5', fn: function() { mod({energy:20,happy:5}); addLog('休息一周后满血复活','good'); }},
                    { text: '带病坚持上课', icon: '💪', effect: '智力+5 精力-15', fn: function() { mod({intel:5,energy:-15}); addLog('硬撑着没落下课程...但更累了',''); }}
                ]
            });
        }
        if (G.partner && chance(40)) {
            pool.push({ emoji: '💔', title: '感情波折', desc: '因为各自忙于学业，你和对象之间有了矛盾...',
                choices: [
                    { text: '认真沟通，一起努力', icon: '❤️', effect: '幸福+10 人脉+5', fn: function() { mod({happy:10,social:5}); addLog('坦诚沟通后感情更好了','good'); }},
                    { text: '暂时分开冷静一下', icon: '😔', effect: '幸福-10', fn: function() { if(chance(40)){G.partner=false;mod({happy:-15});addLog('最终还是分手了...','bad');}else{mod({happy:-5});addLog('冷静后和好了','');} }}
                ]
            });
        }
    }

    // ========== 大三 (2) ==========
    if (s === 2) {
        pool.push({
            emoji: '🔍', title: '大三: 人生岔路口',
            desc: '最关键的一年。考研、出国、就业...你必须做出选择。',
            choices: [
                { text: '全力备考研究生', icon: '📚', effect: '智力+15 压力+20 幸福-10', fn: function() { mod({intel:15,stress:20,happy:-10}); addLog('考研复习开始了，每天6点起床',''); }},
                { text: '准备出国留学（GRE+托福）', icon: '✈️', effect: '智力+10 积蓄-5万', fn: function() { mod({intel:10}); G.money-=5; G.isAbroad=true; addLog('报了GRE班，开始漫长的申请',''); }},
                { text: '秋招找工作', icon: '💼', effect: '积蓄+12万 人脉+15', fn: function() { G.money+=12; mod({social:15,happy:5}); G.hasJob=true; addLog('拿到大厂offer，年薪不错','good'); }},
                { text: '争取保研', icon: '🎯', effect: '声望+10 压力+10', fn: function() { if(G.gpa>=3.4&&G.intel>=60){mod({fame:10});G.hasMaster=true;addLog('综合排名前列，保研成功！','good');checkAch('baoyan','保研达人','🎯');}else{mod({stress:20,happy:-10});addLog('绩点不够，保研失败','bad');} }}
                ]
        });
        if (chance(35)) {
            pool.push({ emoji: '💡', title: '创业的诱惑', desc: '室友拉你一起做一个AI创业项目，投资人已经有了意向...',
                choices: [
                    { text: '加入创业团队', icon: '🚀', effect: '人脉+20 积蓄±? 压力+15', fn: function() { mod({social:20,stress:15}); if(chance(30)){G.money+=20;mod({fame:15});addLog('创业项目拿到融资！','good');checkAch('startup','创业先锋','🚀');}else{G.money-=3;addLog('创业项目失败了...','bad');}}},
                    { text: '专注自己的规划', icon: '📋', effect: '智力+5', fn: function() { mod({intel:5}); addLog('婉拒了创业邀请，专注自己的路',''); }}
                ]
            });
        }
        if (chance(25)) {
            pool.push({ emoji: '🏅', title: '学术会议', desc: '导师带你去参加一个' + G.field + '领域的学术会议...',
                choices: [
                    { text: '做poster展示', icon: '📊', effect: '声望+10 人脉+10', fn: function() { mod({fame:10,social:10}); addLog('第一次参加学术会议，大开眼界','good'); }},
                    { text: '只是去听听报告', icon: '👂', effect: '智力+8', fn: function() { mod({intel:8}); addLog('听了几个顶级学者的报告，收获很大','good'); }}
                ]
            });
        }
    }

    // ========== 大四 (3) ==========
    if (s === 3) {
        if (G.isAbroad) {
            pool.push({ emoji: '✈️', title: '大四: 留学offer', desc: '申请了十几所学校，终于等来了结果...',
                choices: [
                    { text: '接受全奖PhD offer', icon: '🌟', effect: '声望+25 智力+10', fn: function() { mod({fame:25,intel:10}); G.hasPhd=true; G.hasMaster=true; addLog('拿到全奖PhD！飞往海外！','good'); checkAch('abroad','海归精英','🌍'); }},
                    { text: '接受Top50硕士offer', icon: '🎓', effect: '声望+15', fn: function() { mod({fame:15}); G.hasMaster=true; addLog('留学硕士开始','good'); }},
                    { text: '放弃出国留在国内', icon: '🏠', effect: '积蓄+5万', fn: function() { G.isAbroad=false; G.money+=5; addLog('最终选择留在国内',''); }}
                ]
            });
        } else if (G.hasJob && !G.hasMaster) {
            pool.push({ emoji: '💼', title: '大四: 入职还是深造？', desc: '手里有一个大厂offer，但你也在想要不要读研...',
                choices: [
                    { text: '去大厂工作', icon: '🏢', effect: '积蓄+15万 幸福+10', fn: function() { G.money+=15; mod({happy:10,social:10}); addLog('入职大厂，薪水丰厚','good'); }},
                    { text: '放弃offer去读研', icon: '📚', effect: '压力+10 智力+10', fn: function() { G.hasMaster=true; G.hasJob=false; mod({stress:10,intel:10}); addLog('放弃高薪，选择学术道路',''); }}
                ]
            });
        } else {
            var passed = G.intel >= 55 || G.hasMaster;
            pool.push({ emoji: '🎓', title: '大四: 毕业季', desc: passed ? '你成功上岸了！硕士阶段即将开始。' : '考研成绩出来了，压线...',
                choices: passed ? [
                    { text: '学硕，走科研路线', icon: '🔬', effect: '智力+10', fn: function() { G.hasMaster=true; mod({intel:10}); addLog('学硕入学','good'); }},
                    { text: '专硕，偏应用', icon: '⚙️', effect: '人脉+10 积蓄+3万', fn: function() { G.hasMaster=true; mod({social:10}); G.money+=3; addLog('专硕入学','good'); }},
                    { text: '直接读博', icon: '🚀', effect: '智力+15 压力+20', fn: function() { G.hasPhd=true; G.hasMaster=true; mod({intel:15,stress:20}); addLog('直博！勇气可嘉','good'); checkAch('zhibo','直博勇士','🚀'); }}
                ] : [
                    { text: '二战考研', icon: '📚', effect: '压力+20 智力+10', fn: function() { mod({stress:20,intel:10,happy:-10}); if(chance(70)){G.hasMaster=true;addLog('二战上岸！','good');checkAch('erzhan','二战战神','⚔️');}else{addLog('二战又失败...','bad');}}},
                    { text: '直接工作', icon: '💼', effect: '积蓄+10万', fn: function() { G.money+=10; mod({happy:10}); addLog('进入社会工作',''); }},
                    { text: '考公务员', icon: '🏛️', effect: '压力+10', fn: function() { mod({stress:10}); if(chance(35)){addLog('考公上岸！','good');G.money+=6;}else{addLog('考公失败','bad');} }},
                    { text: '间隔年去旅行', icon: '🌏', effect: '幸福+20 精力+15', fn: function() { mod({happy:20,energy:15}); G.money-=3; addLog('环游了一圈，想清楚了人生方向','good'); }}
                ]
            });
        }
        // Graduation thesis
        if (chance(50)) {
            pool.push({ emoji: '📝', title: '毕业论文', desc: '毕设导师催你交初稿了，但你还没开始写...',
                choices: [
                    { text: '连续肝一个月', icon: '🌙', effect: '智力+5 精力-15 压力+10', fn: function() { mod({intel:5,energy:-15,stress:10}); addLog('赶出了毕业论文，勉强通过答辩',''); }},
                    { text: '提前就开始认真做', icon: '📋', effect: '智力+10 声望+5', fn: function() { mod({intel:10,fame:5}); addLog('毕业论文获优秀！','good'); }}
                ]
            });
        }
    }

    // ========== 研一 (4) ==========
    if (s === 4) {
        pool.push({
            emoji: '🔬', title: '研一: 科研入门',
            desc: '研究生的课比本科少，但导师的要求高多了。' + (G.mentor ? '之前的基础让你上手快了不少。' : '一切都要从头学起。'),
            choices: [
                { text: '苦读文献，找创新点', icon: '📖', effect: '智力+15 压力+10', fn: function() { mod({intel:15,stress:10}); addLog('读了上百篇论文，终于找到方向','good'); }},
                { text: '跟师兄师姐学实验', icon: '🧪', effect: '智力+10 人脉+10', fn: function() { mod({intel:10,social:10}); addLog('师兄手把手教你做实验','good'); }},
                { text: '做助教赚外快', icon: '💰', effect: '积蓄+2万 教学+1', fn: function() { G.money+=2; G.teaching++; mod({social:5}); addLog('当了本科生助教',''); }},
                { text: '混日子看看情况', icon: '🐟', effect: '幸福+10 精力+10', fn: function() { mod({happy:10,energy:10}); addLog('研一比较轻松地度过了',''); }}
            ]
        });
        if (chance(40)) {
            pool.push({ emoji: '😤', title: '导师风格', desc: '你发现导师是' + pick(['放羊型（基本不管你）','push型（每天催进度）','学术型（要求极高）','横向型（天天做项目）']),
                choices: [
                    { text: '适应导师节奏', icon: '🤝', effect: '压力-5 人脉+5', fn: function() { mod({stress:-5,social:5}); addLog('慢慢适应了导师的风格',''); }},
                    { text: '自己偷偷做感兴趣的方向', icon: '💡', effect: '智力+10 压力+5', fn: function() { mod({intel:10,stress:5}); addLog('在导师课题外自己探索新方向',''); }}
                ]
            });
        }
    }

    // ========== 研二 (5) ==========
    if (s === 5) {
        pool.push({
            emoji: '📄', title: '研二: 论文冲刺',
            desc: '这一年是出成果的关键期。实验数据终于有了一些眉目...',
            choices: [
                { text: '投顶会/顶刊', icon: '⭐', effect: '智力+10 压力+15', fn: function() { if(chance(30+G.intel/4)){G.topPapers++;G.papers++;mod({intel:10,fame:15});addLog('顶会论文接收了！！','good');checkAch('top_paper','顶会新星','⭐');}else{G.papers++;mod({stress:15});addLog('顶会被拒，改投普通期刊中了','');}}},
                { text: '发几篇普通期刊', icon: '📄', effect: '论文+2 压力+5', fn: function() { G.papers+=2; mod({stress:5}); addLog('稳扎稳打发了2篇期刊','good'); checkAch('first_paper','初出茅庐','📄'); }},
                { text: '做开源项目', icon: '💻', effect: '声望+15 人脉+10', fn: function() { mod({fame:15,social:10}); addLog('开源项目获得了100+ star','good'); }},
                { text: '找实习准备就业', icon: '💼', effect: '积蓄+8万 人脉+10', fn: function() { G.money+=8; mod({social:10}); addLog('研二暑假实习，积累了工业经验','good'); }}
            ]
        });
        if (chance(35)) {
            pool.push({ emoji: '💥', title: '论文被拒', desc: '辛苦写了3个月的论文，收到了拒信。审稿人评语很刻薄...',
                choices: [
                    { text: '认真修改，换个期刊投', icon: '✍️', effect: '智力+8 压力+5', fn: function() { mod({intel:8,stress:5}); if(chance(70)){G.papers++;addLog('修改后换投成功！','good');}else{addLog('又被拒了...继续改','bad');}}},
                    { text: '大改方向重新做实验', icon: '🔄', effect: '智力+12 精力-15', fn: function() { mod({intel:12,energy:-15}); addLog('推倒重来，重新做实验',''); }},
                    { text: '骂审稿人（在心里）', icon: '😤', effect: '压力-10 幸福+5', fn: function() { mod({stress:-10,happy:5}); addLog('在群里吐槽审稿人，心情好多了',''); }}
                ]
            });
        }
    }

    // ========== 研三/博一 (6) ==========
    if (s === 6) {
        if (!G.hasPhd) {
            pool.push({ emoji: '🎓', title: '硕士毕业: 何去何从', desc: '硕士最后一年，你有' + G.papers + '篇论文。未来怎么选？',
                choices: [
                    { text: '继续读博', icon: '📚', effect: '智力+10 压力+15', fn: function() { G.hasPhd=true; mod({intel:10,stress:15}); addLog('决定读博！向学术深水区进发','good'); }},
                    { text: '进入企业工作', icon: '💼', effect: '积蓄+20万 幸福+10', fn: function() { G.money+=20; mod({happy:10}); addLog('硕士毕业，年薪30万+入职','good'); checkAch('master','硕士毕业','🎓'); }},
                    { text: '进高校当辅导员/行政', icon: '🏫', effect: '积蓄+8万 压力-10', fn: function() { G.money+=8; mod({stress:-10,happy:5}); addLog('进了高校做行政工作，稳定',''); }},
                    { text: '出国读博', icon: '✈️', effect: '声望+15 智力+10', fn: function() { G.hasPhd=true; G.isAbroad=true; mod({fame:15,intel:10}); addLog('申请到海外全奖PhD！','good'); checkAch('abroad','海归精英','🌍'); }}
                ]
            });
        } else {
            pool.push({ emoji: '🧪', title: '博士: 第一年', desc: '博士之路正式开始。你需要确定一个具体的研究问题...',
                choices: [
                    { text: '选一个热门方向（竞争激烈但容易发论文）', icon: '🔥', effect: '论文+1 压力+10', fn: function() { G.papers++; mod({stress:10}); addLog('热门方向果然好发论文',''); }},
                    { text: '选冷门方向（风险大但可能有大突破）', icon: '🎲', effect: '智力+15 压力+5', fn: function() { mod({intel:15,stress:5}); addLog('选了一个别人没做过的方向，未来充满未知',''); }},
                    { text: '跟导师的方向走', icon: '🤝', effect: '人脉+10 智力+8', fn: function() { mod({social:10,intel:8}); addLog('跟着导师的项目，资源比较充足','good'); }}
                ]
            });
        }
    }

    // ========== 博二 (7) ==========
    if (s === 7 && G.hasPhd) {
        pool.push({
            emoji: '🔥', title: '博二: 攻坚',
            desc: '实验要做、论文要写、组会要汇报...' + G.field + '领域竞争越来越激烈。',
            choices: [
                { text: '死磕核心创新，冲顶刊', icon: '⭐', effect: '智力+18 压力+20', fn: function() { mod({intel:18,stress:20}); if(chance(35+G.intel/5)){G.topPapers++;G.papers++;addLog('顶刊论文发表！','good');checkAch('top_journal','顶刊作者','📰');}else{addLog('实验还没出结果...继续做','');}}},
                { text: '多写几篇论文量产', icon: '📄', effect: '论文+2 精力-15', fn: function() { G.papers+=2; mod({energy:-15}); addLog('发了2篇论文，毕业有保障了','good'); }},
                { text: '参加国际会议做oral', icon: '🌍', effect: '声望+15 人脉+15', fn: function() { mod({fame:15,social:15}); addLog('在国际会议上做了报告！','good'); }},
                { text: '和工业界合作做项目', icon: '🏭', effect: '积蓄+5万 专利+1', fn: function() { G.money+=5; G.patents++; mod({social:10}); addLog('和企业合作，拿了专利','good'); }}
            ]
        });
        if (chance(50)) {
            pool.push({ emoji: '😰', title: '博士中期危机', desc: '实验做了半年没结果，同届的已经发了2篇顶会...你开始焦虑。',
                choices: [
                    { text: '咬牙坚持', icon: '💪', effect: '智力+10 压力+10', fn: function() { mod({intel:10,stress:10,fame:5}); addLog('终于突破了瓶颈！','good'); }},
                    { text: '调整方向', icon: '🔄', effect: '压力-10', fn: function() { mod({stress:-10,intel:5}); addLog('换了思路，重新出发',''); }},
                    { text: '找人倾诉', icon: '💆', effect: '幸福+10 压力-15', fn: function() { mod({happy:10,stress:-15}); addLog('和朋友聊了很久，心里好多了','good'); }},
                    { text: '考虑退学', icon: '🚪', effect: '压力-30', fn: function() { if(chance(20)){mod({stress:-30});G.hasPhd=false;addLog('退学了...','bad');}else{mod({stress:-20});addLog('想了想还是继续读...','');}}}
                ]
            });
        }
    }

    // ========== 博三 (8) ==========
    if (s === 8 && G.hasPhd) {
        pool.push({ emoji: '📝', title: '博三: 冲刺毕业', desc: '需要达到毕业要求：' + (G.topPapers >= 1 ? '✅ 已满足论文要求' : '❌ 还差顶刊论文') + '。小论文' + G.papers + '篇。',
            choices: [
                { text: '疯狂冲论文', icon: '📄', effect: '论文+2 压力+15 精力-20', fn: function() { G.papers+=2; if(chance(40)){G.topPapers++;}mod({stress:15,energy:-20}); addLog('高产出！','good'); }},
                { text: '专注博士论文写作', icon: '📖', effect: '智力+10 压力+10', fn: function() { mod({intel:10,stress:10}); addLog('博士论文初稿完成','good'); }},
                { text: '开始找博后/工作', icon: '🔍', effect: '人脉+10 压力+5', fn: function() { mod({social:10,stress:5}); addLog('开始海投简历和面试',''); }},
                { text: '和导师谈延期', icon: '😢', effect: '压力-10 幸福-10', fn: function() { mod({stress:-10,happy:-10}); addLog('决定延期一年毕业',''); }}
            ]
        });
    }

    // ========== 博四/博后 (9-10) ==========
    if (s === 9 || s === 10) {
        pool.push({ emoji: '🏫', title: s === 9 ? '博士后: 积累期' : '博后第二年', desc: '博后阶段需要大量产出，为学术求职做准备。',
            choices: [
                { text: '疯狂发论文', icon: '📄', effect: '论文+3 压力+15', fn: function() { G.papers+=3; if(chance(35)){G.topPapers++;}mod({stress:15,energy:-15}); addLog('爆发期！发了3篇','good'); }},
                { text: '申请基金', icon: '💰', effect: '声望+15 基金+25万', fn: function() { mod({fame:15}); G.funding+=25; addLog('博后基金中了！','good'); checkAch('first_fund','基金破冰','💰'); }},
                { text: '申请高校教职', icon: '🎓', effect: '声望+10', fn: function() { mod({fame:10,stress:10}); addLog('面试了好几所高校',''); }},
                { text: '去企业研究院', icon: '🏢', effect: '积蓄+35万', fn: function() { G.money+=35; mod({happy:10}); addLog('进入企业，薪资翻倍','good'); }}
            ]
        });
    }

    // ========== 讲师 (11) ==========
    if (s === 11) {
        pool.push({ emoji: '👨‍🏫', title: '讲师: 教学科研双轨', desc: '入职高校了！一边上课一边做科研，时间永远不够用...',
            choices: [
                { text: '冲国自然青年基金', icon: '💰', effect: '声望+20 基金+50万', fn: function() { if(chance(28+G.fame/4)){G.funding+=50;mod({fame:20});addLog('国自然青年基金中了！','good');checkAch('nsfc','国自然得主','🏅');}else{mod({stress:15,happy:-10});addLog('国自然没中...','bad');}}},
                { text: '认真教学', icon: '📋', effect: '教学+2 幸福+10 学生+3', fn: function() { G.teaching+=2; G.students+=3; mod({happy:10,fame:5}); addLog('获得教学优秀奖','good'); }},
                { text: '横向项目赚经费', icon: '🏭', effect: '基金+30万 人脉+10', fn: function() { G.funding+=30; mod({social:10}); addLog('横向项目到账','good'); }},
                { text: '带研究生', icon: '👥', effect: '学生+5 声望+8', fn: function() { G.students+=5; mod({fame:8,energy:-10}); addLog('开始招研究生了','good'); }}
            ]
        });
        if (chance(30)) {
            pool.push({ emoji: '📊', title: '年终考核', desc: '高校考核压力大，publish or perish...',
                choices: [
                    { text: '拼命发论文', icon: '📄', effect: '论文+2 压力+15', fn: function() { G.papers+=2; mod({stress:15}); addLog('考核过关了','good'); }},
                    { text: '申请项目充业绩', icon: '💼', effect: '基金+15万 压力+5', fn: function() { G.funding+=15; mod({stress:5}); addLog('横向项目充了业绩',''); }}
                ]
            });
        }
    }

    // ========== 副教授 (12) ==========
    if (s === 12) {
        pool.push({ emoji: '📊', title: '副教授: 冲刺正教授', desc: '距离教授还差标志性成果。你有' + G.topPapers + '篇顶刊，经费' + G.funding + '万。',
            choices: [
                { text: '冲击Nature/Science子刊', icon: '⭐', effect: '声望+30 压力+25', fn: function() { if(chance(18+G.intel/5+G.fame/5)){G.topPapers+=2;G.papers++;mod({fame:30});addLog('Nature子刊发表！学术高光！','good');checkAch('nature','Nature级学者','🌟');}else{mod({stress:25,happy:-10});addLog('投稿被拒...','bad');}}},
                { text: '申请面上项目', icon: '💰', effect: '基金+80万', fn: function() { if(chance(25+G.fame/4)){G.funding+=80;mod({fame:15});addLog('面上项目80万！','good');}else{addLog('面上没中','bad');mod({stress:10});}}},
                { text: '出国访学一年', icon: '✈️', effect: '智力+15 声望+20 人脉+20', fn: function() { mod({intel:15,fame:20,social:20}); addLog('海外访学，收获巨大','good'); }},
                { text: '写专著', icon: '📖', effect: '声望+15', fn: function() { mod({fame:15,intel:5}); addLog('出版学术专著','good'); checkAch('book','著书立说','📖'); }}
            ]
        });
    }

    // ========== 教授 (13) ==========
    if (s === 13) {
        pool.push({ emoji: '🏆', title: '教授: 学术领袖', desc: '你是' + G.field + '领域的知名教授了。接下来追求什么？',
            choices: [
                { text: '冲杰青/长江学者', icon: '👑', effect: '声望+30', fn: function() { if(G.fame>=70&&G.topPapers>=4&&chance(25)){mod({fame:30});addLog('获得杰青！！','good');checkAch('jieqing','杰出青年','👑');}else{mod({stress:15});addLog('今年差一点...','bad');}}},
                { text: '创办学术会议', icon: '📰', effect: '声望+20 人脉+20', fn: function() { mod({fame:20,social:20}); addLog('创办的会议影响力越来越大','good'); }},
                { text: '培养学生', icon: '👨‍🎓', effect: '学生+10 幸福+15', fn: function() { G.students+=10; mod({happy:15,fame:10}); addLog('桃李满天下','good'); checkAch('mentor','桃李满天下','🌳'); }},
                { text: '享受生活', icon: '🏡', effect: '幸福+25 压力-20', fn: function() { mod({happy:25,stress:-20}); addLog('多陪伴家人，幸福感满满','good'); }}
            ]
        });
    }

    // ========== 随机事件 ==========
    if (s >= 1 && chance(30)) {
        var randomEvents = [
            { emoji: '🎲', title: '意外之喜', desc: '你的一篇旧论文突然被大量引用，h-index飙升！', choices: [
                { text: '趁热打铁继续深入', icon: '🔥', effect: '声望+10 论文+1', fn: function() { G.papers++; mod({fame:10}); addLog('热点论文带来了新合作','good'); }},
                { text: '低调处理', icon: '🤫', effect: '声望+5', fn: function() { mod({fame:5}); addLog('论文火了，但保持低调',''); }}
            ]},
            { emoji: '🐱', title: '养了只猫', desc: '路边捡了只小猫，决定收养它。', choices: [
                { text: '给它取个名字：Paper', icon: '🐱', effect: '幸福+15 压力-10', fn: function() { mod({happy:15,stress:-10}); addLog('猫猫Paper成了你的精神支柱','good'); checkAch('cat','铲屎官','🐱'); }},
                { text: '送给朋友养', icon: '🤝', effect: '人脉+5', fn: function() { mod({social:5}); addLog('朋友很开心收养了猫咪',''); }}
            ]},
            { emoji: '🏃', title: '健身觉醒', desc: '体检报告显示你严重缺乏运动...', choices: [
                { text: '开始每天跑步', icon: '🏃', effect: '精力+15 幸福+10', fn: function() { mod({energy:15,happy:10}); addLog('坚持跑步，身体好多了','good'); }},
                { text: '明天再说吧', icon: '😴', effect: '幸福+3', fn: function() { mod({happy:3}); addLog('"明天一定去运动"——你又说了一次',''); }}
            ]},
            { emoji: '🎤', title: '学术报告', desc: '被邀请在' + pick(['中国计算机大会','全国博士生论坛','国际学术会议']) + '做报告',
                choices: [
                    { text: '精心准备演讲', icon: '📊', effect: '声望+12 人脉+10', fn: function() { mod({fame:12,social:10}); addLog('报告获得好评！','good'); }},
                    { text: '随便讲讲', icon: '😅', effect: '声望+3', fn: function() { mod({fame:3}); addLog('报告一般般...',''); }}
            ]},
            { emoji: '📧', title: '审稿邀请', desc: '收到了一封来自' + pick(['IEEE','ACM','Elsevier']) + '的审稿邀请',
                choices: [
                    { text: '认真审稿', icon: '✍️', effect: '智力+5 声望+8', fn: function() { mod({intel:5,fame:8}); addLog('高质量审稿获得编辑好评','good'); }},
                    { text: '太忙了，拒绝', icon: '❌', effect: '精力+5', fn: function() { mod({energy:5}); addLog('婉拒了审稿邀请',''); }}
            ]}
        ];
        pool.push(pick(randomEvents));
    }

    // ========== 压力过高事件 ==========
    if (G.stress >= 75 && G.energy <= 35 && chance(60)) {
        pool.push({ emoji: '⚠️', title: '身体亮红灯', desc: '长期高压让你' + pick(['严重失眠','头痛不止','免疫力下降频繁感冒','焦虑到无法集中注意力']),
            choices: [
                { text: '休息一段时间', icon: '🛌', effect: '精力+30 压力-30 幸福+10', fn: function() { mod({energy:30,stress:-30,happy:10}); addLog('强制休息了一个月','good'); }},
                { text: '硬撑继续干', icon: '💊', effect: '压力+10 精力-10', fn: function() { mod({stress:10,energy:-10,happy:-10}); G.burnout=true; addLog('身体越来越差...','bad'); }}
            ]
        });
    }

    return pool.length > 0 ? pick(pool) : null;
}

// ==================== Game Flow ====================
function startGame() {
    G.name = document.getElementById('playerName').value.trim() || '科研小白';
    G.field = document.getElementById('playerField').value;
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    addLog('【' + G.name + '】进入' + G.field + '专业，大学生活开始！', 'good');
    nextTurn();
}

function nextTurn() {
    G.turnCount++;
    if (G.stage >= 14 || G.year >= 2065 || (G.energy <= 0 && G.stress >= 90)) { endGame(); return; }
    if (!G.hasMaster && G.stage >= 4 && !G.hasJob && G.money < 10) { endGame(); return; }

    if (G.turnCount > 1) {
        G.year++; G.age++;
        // Stage progression
        if (G.stage <= 3) { G.stage++; }
        else if (G.stage === 4 && G.substage >= 1) { G.stage = 5; G.substage = 0; }
        else if (G.stage === 5 && G.substage >= 1) {
            if (G.hasPhd) { G.stage = 6; G.substage = 0; }
            else { G.stage = 6; G.substage = 0; checkAch('master','硕士毕业','🎓'); }
        }
        else if (G.stage === 6) {
            if (G.hasPhd) { G.stage = 7; G.substage = 0; }
            else if (G.hasMaster && !G.hasPhd) { /* can stay or leave */ }
        }
        else if (G.stage === 7 && G.hasPhd) { G.stage = 8; G.substage = 0; }
        else if (G.stage === 8 && G.hasPhd) { G.stage = 9; G.substage = 0; checkAch('phd','博士帽','🎓'); }
        else if (G.stage === 9) { G.stage = 10; G.substage = 0; }
        else if (G.stage === 10 && G.substage >= 1) { G.stage = 11; G.substage = 0; addLog('入职高校成为讲师！','good'); }
        else if (G.stage === 11 && G.papers >= 8 && G.fame >= 30 && G.substage >= 2) { G.stage = 12; G.substage = 0; addLog('评上副教授！','good'); checkAch('assoc_prof','副教授','👨‍🏫'); }
        else if (G.stage === 12 && G.topPapers >= 3 && G.fame >= 55 && G.funding >= 50 && G.substage >= 2) { G.stage = 13; G.substage = 0; addLog('晋升教授！！','good'); checkAch('professor','教授','🏅'); }
        else if (G.stage === 13 && G.fame >= 85 && G.topPapers >= 6 && G.substage >= 2) { G.stage = 14; }
        else { G.substage++; }
    }

    // Natural changes
    mod({ energy: rand(-3, 5), stress: rand(-2, 4) });
    if (G.partner) mod({ happy: 2, stress: -2 });
    if (G.burnout) mod({ energy: -5, happy: -3 });
    if (G.age >= 35) mod({ energy: -1 });

    updateUI();
    showEvent(getEvents());
}

function showEvent(event) {
    if (!event) { nextTurn(); return; }
    document.getElementById('eventEmoji').textContent = event.emoji;
    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('eventDesc').textContent = event.desc;
    var el = document.getElementById('choices');
    el.innerHTML = '';
    event.choices.forEach(function(c) {
        var btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = '<span class="choice-icon">' + c.icon + '</span><div><div class="choice-text">' + c.text + '</div><div class="choice-effect">' + c.effect + '</div></div>';
        btn.onclick = function() { c.fn(); updateUI(); setTimeout(nextTurn, 300); };
        el.appendChild(btn);
    });
    document.getElementById('eventCard').style.animation = 'none';
    setTimeout(function() { document.getElementById('eventCard').style.animation = 'fadeIn 0.4s ease'; }, 10);
}

function updateUI() {
    document.getElementById('statYear').textContent = G.year;
    document.getElementById('statStage').textContent = STAGES[Math.min(G.stage, 14)] || '社会人';
    document.getElementById('statPapers').textContent = G.papers;
    document.getElementById('statMoney').textContent = G.money;
    [['Intel',G.intel],['Energy',G.energy],['Social',G.social],['Stress',G.stress],['Fame',G.fame],['Happy',G.happy]].forEach(function(b) {
        var bar = document.getElementById('bar' + b[0]);
        var num = document.getElementById('stat' + b[0]);
        if (bar) bar.style.width = b[1] + '%';
        if (num) num.textContent = b[1];
    });
}

function toggleLog() {
    var c = document.getElementById('logContent');
    c.classList.toggle('open');
    document.getElementById('logToggleIcon').textContent = c.classList.contains('open') ? '▲' : '▼';
    c.innerHTML = G.log.slice().reverse().map(function(l) {
        return '<div class="log-item"><span class="log-year">[' + l.year + ']</span> <span class="log-' + l.type + '">' + l.text + '</span></div>';
    }).join('');
}

function endGame() {
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('endScreen').classList.add('active');
    var title, desc;
    if (G.stage >= 14) { title = '学术泰斗'; desc = '你站在了学术巅峰，名垂学术史册。一路走来，无数论文、基金和学生见证了你的辉煌。'; }
    else if (G.stage >= 13) { title = '知名教授'; desc = '你是' + G.field + '领域的知名教授，科研和教学都有很高成就。'; }
    else if (G.stage >= 12) { title = '副教授'; desc = '你在学术界稳步前行，前方的教授之路指日可待。'; }
    else if (G.stage >= 11) { title = '高校讲师'; desc = '教书育人的道路虽然平凡，但培养了不少优秀学生。'; }
    else if (G.stage >= 9) { title = '科研工作者'; desc = '在科研道路上探索，虽然辛苦但始终没放弃。'; }
    else if (G.money >= 50) { title = '商业精英'; desc = '离开学术圈在商界闯出了一片天，财富自由。'; }
    else if (G.happy >= 80) { title = '幸福达人'; desc = '也许没有论文等身，但你活出了自己想要的样子。'; }
    else if (G.partner && G.happy >= 60) { title = '人生赢家'; desc = '事业和爱情双丰收，人生圆满。'; }
    else { title = '平凡一生'; desc = '普通但真实的人生，有遗憾也有收获。'; }

    document.getElementById('endCard').innerHTML =
        '<h3>' + G.name + '</h3><div class="end-title-badge">' + title + '</div>' +
        '<p style="margin-top:1rem">' + desc + '</p>' +
        '<p style="margin-top:0.5rem;font-size:0.85rem;color:#888">' + G.field + ' · ' + G.year + '年 · ' + G.age + '岁</p>';
    document.getElementById('endStats').innerHTML =
        '<div class="end-stat"><div class="end-stat-num">' + G.papers + '</div><div class="end-stat-label">论文</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.topPapers + '</div><div class="end-stat-label">顶刊/顶会</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.funding + '万</div><div class="end-stat-label">科研经费</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.students + '</div><div class="end-stat-label">培养学生</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.patents + '</div><div class="end-stat-label">专利</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.money + '万</div><div class="end-stat-label">积蓄</div></div>';
    var h = '<h4>🏅 成就 (' + G.achievements.length + ')</h4>';
    if (!G.achievements.length) h += '<p style="color:#666;font-size:0.85rem">暂无成就</p>';
    G.achievements.forEach(function(a) { h += '<div class="achievement"><span class="ach-icon">' + a.icon + '</span> ' + a.name + '</div>'; });
    // Score
    var score = G.papers * 10 + G.topPapers * 50 + G.fame * 2 + G.funding / 5 + G.students * 3 + G.happy + G.achievements.length * 20;
    h += '<div style="margin-top:1rem;text-align:center"><p style="color:#888">综合评分</p><p style="font-size:2rem;color:#667eea;font-weight:700">' + Math.round(score) + '</p></div>';
    document.getElementById('endAchievements').innerHTML = h;
}

// ==================== Research Life Simulator ====================

var G = {
    name: '', field: '', year: 2020, age: 18,
    stage: 0, // 0=大一 1=大二 2=大三 3=大四 4=硕士 5=博士 6=博后 7=讲师 8=副教授 9=教授 10=杰青/院士
    intel: 50, energy: 100, social: 20, stress: 10, fame: 0, happy: 80,
    papers: 0, topPapers: 0, patents: 0, money: 0, funding: 0,
    students: 0, awards: 0,
    gpa: 0, hasPhd: false, hasMaster: false, isAbroad: false,
    mentor: '', partner: false, burnout: false,
    log: [], achievements: [], eventIndex: 0, turnCount: 0
};

var STAGES = ['大一新生','大二','大三','大四','硕士研究生','博士研究生','博士后','讲师','副教授','教授','杰出学者'];
var EMOJIS = { good: '🎉', bad: '😰', paper: '📄', money: '💰', think: '🤔', love: '❤️', work: '💪', luck: '🍀', warning: '⚠️', trophy: '🏆', grad: '🎓', teach: '👨‍🏫', rest: '🛌', idea: '💡', fire: '🔥', star: '⭐' };

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function chance(pct) { return Math.random() * 100 < pct; }

function mod(changes) {
    Object.keys(changes).forEach(function(k) {
        if (k in G) G[k] = clamp(G[k] + changes[k], 0, 100);
        if (k === 'papers' || k === 'topPapers' || k === 'money' || k === 'funding' || k === 'patents' || k === 'students' || k === 'awards') {
            G[k] = Math.max(0, G[k] + changes[k]);
        }
    });
}

function addLog(text, type) {
    G.log.push({ year: G.year, text: text, type: type || '' });
}

function checkAchievement(id, name, icon) {
    if (G.achievements.find(function(a) { return a.id === id; })) return;
    G.achievements.push({ id: id, name: name, icon: icon });
    addLog('🏅 解锁成就: ' + name, 'good');
}

// ==================== Events Database ====================
function getEvents() {
    var s = G.stage;
    var events = [];

    // === 本科阶段 (stage 0-3) ===
    if (s === 0) {
        events.push({
            emoji: '🎒', title: '大一开学',
            desc: '你怀着憧憬走进了大学校园。' + G.field + '专业的课程即将开始，你打算怎样度过这一年？',
            choices: [
                { text: '认真学习，争取奖学金', icon: '📚', effect: '智力+15 精力-10 幸福-5', fn: function() { mod({intel:15,energy:-10,happy:-5}); G.gpa=3.5; addLog('刻苦学习，期末GPA 3.5','good'); }},
                { text: '加入社团，拓展人脉', icon: '🎭', effect: '人脉+20 幸福+10 智力+5', fn: function() { mod({social:20,happy:10,intel:5}); addLog('加入了3个社团，认识了很多朋友','good'); }},
                { text: '躺平摸鱼，享受大学生活', icon: '🎮', effect: '幸福+15 精力+10 智力-5', fn: function() { mod({happy:15,energy:10,intel:-5}); G.gpa=2.5; addLog('大一在游戏中度过...',''); }},
                { text: '进实验室，提前接触科研', icon: '🔬', effect: '智力+20 声望+5 精力-15', fn: function() { mod({intel:20,fame:5,energy:-15}); addLog('大一就进了实验室，导师很赏识','good'); G.mentor='本科导师'; }}
            ]
        });
    }
    if (s === 1) {
        events.push({
            emoji: '📖', title: '大二: 专业分流',
            desc: '专业课开始加深，你开始思考未来的方向。班里有人已经在准备考研了。',
            choices: [
                { text: '深入专业课，打好理论基础', icon: '📐', effect: '智力+15 压力+10', fn: function() { mod({intel:15,stress:10}); G.gpa=Math.max(G.gpa,3.5); addLog('专业课成绩优秀','good'); }},
                { text: '参加数学建模竞赛', icon: '🏆', effect: '智力+10 声望+10 精力-10', fn: function() { mod({intel:10,fame:10,energy:-10}); if(chance(60)){G.awards++;addLog('数学建模获得省奖！','good');checkAchievement('contest','竞赛达人','🏅');}else{addLog('建模比赛没获奖，但学到很多','');}}},
                { text: '找实习，积累工作经验', icon: '💼', effect: '人脉+15 积蓄+2万 智力+5', fn: function() { mod({social:15,intel:5}); G.money+=2; addLog('暑假在科技公司实习','good'); }},
                { text: '开始准备考研', icon: '📝', effect: '智力+10 压力+15 幸福-10', fn: function() { mod({intel:10,stress:15,happy:-10}); addLog('提前开始考研准备',''); }}
            ]
        });
        if (chance(30)) {
            events.push({
                emoji: '❤️', title: '校园邂逅',
                desc: '在图书馆遇到了一个让你心动的人...',
                choices: [
                    { text: '鼓起勇气表白', icon: '💌', effect: '幸福±? 人脉+5', fn: function() { if(chance(50)){G.partner=true;mod({happy:20,social:5});addLog('表白成功！恋爱了','good');}else{mod({happy:-10,social:5});addLog('被委婉拒绝了...','bad');}}},
                    { text: '先做朋友慢慢来', icon: '🤝', effect: '人脉+10 幸福+5', fn: function() { mod({social:10,happy:5}); addLog('多了一个好朋友',''); }},
                    { text: '专注学业，感情的事以后再说', icon: '📚', effect: '智力+5 压力-5', fn: function() { mod({intel:5,stress:-5}); addLog('决定先专注学业',''); }}
                ]
            });
        }
    }
    if (s === 2) {
        events.push({
            emoji: '🔍', title: '大三: 人生岔路口',
            desc: '大三了，你需要认真考虑毕业后的去向。周围同学有考研的、出国的、找工作的...',
            choices: [
                { text: '全力备考研究生', icon: '📚', effect: '智力+15 压力+20 幸福-15', fn: function() { mod({intel:15,stress:20,happy:-15,energy:-10}); addLog('开始了艰苦的考研复习',''); }},
                { text: '准备出国留学', icon: '✈️', effect: '智力+10 积蓄-5万 人脉+10', fn: function() { mod({intel:10,social:10}); G.money-=5; G.isAbroad=true; addLog('开始准备GRE/托福',''); }},
                { text: '直接找工作', icon: '💼', effect: '积蓄+8万 人脉+15 声望+5', fn: function() { mod({social:15,fame:5}); G.money+=8; addLog('拿到了不错的offer','good'); }},
                { text: '争取保研名额', icon: '🎯', effect: '智力+10 压力+10 声望+10', fn: function() { if(G.gpa>=3.5&&G.intel>=60){mod({intel:10,fame:10,stress:10});addLog('GPA优秀，成功保研！','good');}else{mod({stress:20,happy:-10});addLog('GPA不够，保研失败...只能考研','bad');} }}
            ]
        });
    }
    if (s === 3) {
        var passed = G.intel >= 55;
        if (G.isAbroad) {
            events.push({
                emoji: '✈️', title: '大四: 留学申请结果',
                desc: '经过漫长的等待，offer终于来了...',
                choices: [
                    { text: '接受Top50大学的offer', icon: '🌟', effect: '声望+20 智力+10', fn: function() { mod({fame:20,intel:10}); G.hasMaster=true; addLog('拿到世界Top50大学录取！','good'); checkAchievement('abroad','海归精英','🌍'); }},
                    { text: '放弃出国，在国内读研', icon: '🏠', effect: '积蓄+5万 幸福+10', fn: function() { G.isAbroad=false; G.hasMaster=true; G.money+=5; mod({happy:10}); addLog('决定留在国内发展',''); }}
                ]
            });
        } else {
            events.push({
                emoji: '🎓', title: '大四: 毕业抉择',
                desc: passed ? '你的努力有了回报，考研/保研成功了！现在要选择方向。' : '考研分数不太理想...你需要做出选择。',
                choices: passed ? [
                    { text: '读学术型硕士，走科研路线', icon: '🔬', effect: '智力+10 声望+5', fn: function() { G.hasMaster=true; mod({intel:10,fame:5}); addLog('开始硕士学习，选择了科研方向','good'); }},
                    { text: '读专业型硕士，偏应用方向', icon: '⚙️', effect: '人脉+10 积蓄+3万', fn: function() { G.hasMaster=true; mod({social:10}); G.money+=3; addLog('专硕入学，与企业联系紧密','good'); }},
                    { text: '直博！一步到位', icon: '🚀', effect: '智力+15 压力+20 声望+10', fn: function() { G.hasPhd=true; G.hasMaster=true; mod({intel:15,stress:20,fame:10}); addLog('选择了直博，勇气可嘉！','good'); checkAchievement('zhibo','直博勇士','🚀'); }}
                ] : [
                    { text: '二战考研', icon: '📚', effect: '压力+20 智力+10 幸福-15', fn: function() { mod({stress:20,intel:10,happy:-15}); if(chance(70)){G.hasMaster=true;addLog('二战上岸！','good');}else{addLog('二战失败...','bad');}}},
                    { text: '直接工作', icon: '💼', effect: '积蓄+10万 人脉+10', fn: function() { G.money+=10; mod({social:10,happy:10}); addLog('进入企业工作',''); }},
                    { text: '考公务员', icon: '🏛️', effect: '压力+10 幸福+5', fn: function() { mod({stress:10,happy:5}); if(chance(40)){addLog('考公上岸！铁饭碗','good');G.money+=5;}else{addLog('考公落选','bad');} }}
                ]
            });
        }
    }

    // === 硕士阶段 (stage 4) ===
    if (s === 4) {
        events.push({
            emoji: '🔬', title: '硕士: 科研起步',
            desc: '导师给你分配了研究课题。' + (G.mentor ? '你之前的导师推荐了你，新导师对你很看好。' : '你需要从零开始学习。'),
            choices: [
                { text: '全身心投入科研，冲论文', icon: '📄', effect: '智力+15 精力-15 压力+15', fn: function() { mod({intel:15,energy:-15,stress:15}); if(chance(50+G.intel/3)){G.papers++;addLog('硕士期间发表了第一篇论文！','good');checkAchievement('first_paper','初出茅庐','📄');}else{addLog('实验没做出来，论文还在写...','');}}},
                { text: '跟导师做横向项目赚钱', icon: '💰', effect: '积蓄+5万 人脉+10 智力+5', fn: function() { G.money+=5; mod({social:10,intel:5}); addLog('横向项目到账，赚了外快','good'); }},
                { text: '边读研边在企业实习', icon: '💼', effect: '积蓄+8万 人脉+15 精力-10', fn: function() { G.money+=8; mod({social:15,energy:-10}); addLog('硕士期间积累了丰富的工业经验','good'); }},
                { text: '准备申请博士', icon: '🎯', effect: '智力+10 压力+10 声望+5', fn: function() { mod({intel:10,stress:10,fame:5}); addLog('开始联系博士导师，套磁中...',''); }}
            ]
        });
        if (chance(40)) {
            events.push({
                emoji: '😤', title: '导师催进度',
                desc: '"你的论文写到哪了？下个月组会汇报！" 导师在群里@你...',
                choices: [
                    { text: '通宵赶进度', icon: '🌙', effect: '智力+5 精力-20 压力+15', fn: function() { mod({intel:5,energy:-20,stress:15}); if(chance(60)){addLog('赶出来了！虽然很累','');}else{addLog('通宵了但还是没赶完...','bad');}}},
                    { text: '坦诚跟导师沟通', icon: '🗣️', effect: '人脉+5 压力-10', fn: function() { mod({social:5,stress:-10}); addLog('导师表示理解，给了更多时间','good'); }},
                    { text: '摸鱼装忙', icon: '🐟', effect: '幸福+5 压力+5', fn: function() { mod({happy:5,stress:5}); addLog('蒙混过关了这次...',''); }}
                ]
            });
        }
    }

    // === 博士阶段 (stage 5) ===
    if (s === 5) {
        events.push({
            emoji: '🧪', title: '博士: 学术深水区',
            desc: '博士阶段是科研人生最关键的时期。你的研究方向是' + G.field + '，你打算怎么规划？',
            choices: [
                { text: '死磕一个创新方向', icon: '🔥', effect: '智力+20 压力+20 声望+10', fn: function() { mod({intel:20,stress:20,fame:10}); if(chance(40+G.intel/5)){G.topPapers++;G.papers+=2;addLog('突破了！发了一篇顶刊！','good');checkAchievement('top_paper','顶刊新星','⭐');}else{G.papers++;addLog('发了一篇普通期刊，顶刊还在冲...','');}}},
                { text: '多线并行，广撒网', icon: '🕸️', effect: '智力+10 论文+2 精力-15', fn: function() { mod({intel:10,energy:-15}); G.papers+=2; addLog('产出稳定，发了2篇论文','good'); }},
                { text: '与海外团队合作交流', icon: '🌍', effect: '声望+15 人脉+15 智力+10', fn: function() { mod({fame:15,social:15,intel:10}); if(chance(50)){G.papers++;addLog('国际合作论文发表！','good');}else{addLog('合作进展缓慢，但拓展了视野','');}}},
                { text: '专注写专利和做系统', icon: '⚙️', effect: '专利+1 积蓄+3万 智力+5', fn: function() { G.patents++; G.money+=3; mod({intel:5}); addLog('拿到了一项发明专利','good'); checkAchievement('patent','发明家','⚙️'); }}
            ]
        });
        if (chance(50)) {
            events.push({
                emoji: '😰', title: '博士中期危机',
                desc: '实验做了半年没结果，论文被拒了两次，同届的同学都发了顶会...你开始怀疑自己。',
                choices: [
                    { text: '咬牙坚持，从失败中找方向', icon: '💪', effect: '智力+10 压力+10 声望+5', fn: function() { mod({intel:10,stress:10,fame:5}); addLog('痛苦但没放弃，终于找到新思路','good'); }},
                    { text: '换一个研究方向', icon: '🔄', effect: '压力-10 智力+5', fn: function() { mod({stress:-10,intel:5}); addLog('及时调整方向，重新出发',''); }},
                    { text: '去看心理咨询', icon: '💆', effect: '幸福+15 压力-20 精力+10', fn: function() { mod({happy:15,stress:-20,energy:10}); addLog('心理咨询帮了大忙','good'); }},
                    { text: '退学', icon: '🚪', effect: '压力-50 幸福+10', fn: function() { mod({stress:-50,happy:10}); addLog('离开了学术圈...','bad'); G.stage=99; }}
                ]
            });
        }
    }

    // === 博士后 (stage 6) ===
    if (s === 6) {
        events.push({
            emoji: '🏫', title: '博士后: 积累期',
            desc: '博后阶段需要大量产出，为求职做准备。',
            choices: [
                { text: '疯狂发论文，冲刺学术简历', icon: '📄', effect: '论文+3 压力+15 精力-20', fn: function() { G.papers+=3; if(chance(30)){G.topPapers++;}mod({stress:15,energy:-20}); addLog('产出爆发，发了3篇论文','good'); }},
                { text: '申请基金，独立开展研究', icon: '💰', effect: '声望+15 基金+20万', fn: function() { mod({fame:15}); G.funding+=20; addLog('博后基金申请成功！20万','good'); checkAchievement('first_fund','基金破冰','💰'); }},
                { text: '跳槽去企业研究院', icon: '🏢', effect: '积蓄+30万 人脉+15', fn: function() { G.money+=30; mod({social:15,happy:10}); addLog('进入企业研究院，薪资翻倍','good'); }},
                { text: '申请高校教职', icon: '🎓', effect: '声望+10 压力+10', fn: function() { mod({fame:10,stress:10}); addLog('开始海投简历，面试中...',''); }}
            ]
        });
    }

    // === 讲师 (stage 7) ===
    if (s === 7) {
        events.push({
            emoji: '👨‍🏫', title: '讲师: 教学与科研的平衡',
            desc: '入职高校了！既要上课又要做科研，还要申请基金...时间永远不够用。',
            choices: [
                { text: '全力申请国家自然科学基金', icon: '💰', effect: '声望+20 压力+15 基金+50万', fn: function() { if(chance(30+G.fame/3)){G.funding+=50;mod({fame:20,stress:15});addLog('国自然青年基金中了！50万！','good');checkAchievement('nsfc','国自然得主','🏅');}else{mod({stress:20,happy:-10});addLog('国自然没中...明年再战','bad');}}},
                { text: '认真教学，争取教学奖', icon: '📋', effect: '声望+10 幸福+10 学生+3', fn: function() { mod({fame:10,happy:10}); G.students+=3; addLog('获得教学优秀奖，学生们很喜欢你','good'); }},
                { text: '和企业合作横向项目', icon: '🏭', effect: '基金+30万 人脉+15', fn: function() { G.funding+=30; mod({social:15}); addLog('横向项目到账30万','good'); }},
                { text: '带研究生，培养团队', icon: '👥', effect: '学生+5 声望+10 精力-10', fn: function() { G.students+=5; mod({fame:10,energy:-10}); addLog('开始带研究生了','good'); }}
            ]
        });
    }

    // === 副教授 (stage 8) ===
    if (s === 8) {
        events.push({
            emoji: '📊', title: '副教授: 冲击正教授',
            desc: '你已经在学术界站稳脚跟，但距离教授还有一段距离。你需要更多的标志性成果。',
            choices: [
                { text: '冲击Nature/Science子刊', icon: '⭐', effect: '声望+30 压力+25 智力+10', fn: function() { if(chance(20+G.intel/5+G.fame/5)){G.topPapers+=2;G.papers++;mod({fame:30,stress:25,intel:10});addLog('Nature子刊发表！学术生涯高光时刻！','good');checkAchievement('nature','Nature级学者','🌟');}else{mod({stress:25,happy:-15});addLog('投稿被拒，审稿人意见很苛刻...','bad');}}},
                { text: '申请国自然面上项目', icon: '💰', effect: '基金+80万 声望+15', fn: function() { if(chance(25+G.fame/4)){G.funding+=80;mod({fame:15});addLog('面上项目中了！80万经费！','good');}else{mod({stress:10});addLog('面上项目没中','bad');}}},
                { text: '出国访学一年', icon: '✈️', effect: '智力+15 声望+20 人脉+20', fn: function() { mod({intel:15,fame:20,social:20}); addLog('在海外顶级实验室访学，收获巨大','good'); }},
                { text: '写一本教材/专著', icon: '📖', effect: '声望+15 智力+5', fn: function() { mod({fame:15,intel:5}); addLog('出版了一本专业教材','good'); checkAchievement('book','著书立说','📖'); }}
            ]
        });
    }

    // === 教授 (stage 9) ===
    if (s === 9) {
        events.push({
            emoji: '🏆', title: '教授: 学术领袖',
            desc: '你已经是教授了，在' + G.field + '领域有了一定影响力。接下来你想追求什么？',
            choices: [
                { text: '冲击杰青/长江学者', icon: '🌟', effect: '声望+30 压力+20', fn: function() { if(G.fame>=70&&G.topPapers>=3&&chance(30)){mod({fame:30});addLog('获得杰青/长江学者称号！！！','good');checkAchievement('jieqing','杰出青年','👑');}else{mod({stress:20,happy:-10});addLog('今年没选上，继续努力','bad');}}},
                { text: '创办学术期刊/会议', icon: '📰', effect: '声望+20 人脉+20', fn: function() { mod({fame:20,social:20}); addLog('创办了一个新的学术会议，影响力不断扩大','good'); }},
                { text: '培养杰出学生', icon: '👨‍🎓', effect: '学生+10 幸福+15 声望+10', fn: function() { G.students+=10; mod({happy:15,fame:10}); addLog('你的学生获得了重要奖项，桃李满天下','good'); checkAchievement('mentor_great','桃李满天下','🌳'); }},
                { text: '享受生活，回归家庭', icon: '🏡', effect: '幸福+25 压力-20', fn: function() { mod({happy:25,stress:-20}); addLog('更多时间陪伴家人，幸福感大增','good'); }}
            ]
        });
    }

    // === Random events (can appear at any stage) ===
    if (s >= 1 && chance(25)) {
        events.push({
            emoji: '🎲', title: '意外事件',
            desc: [
                '你的论文被引用了很多次，突然火了！',
                '学校食堂旁的猫生小猫了，你领养了一只。',
                '室友/同事拉你参加马拉松...',
                '收到了一封来自顶级期刊的审稿邀请。',
                '你在学术会议上的演讲获得了满堂彩！'
            ][rand(0,4)],
            choices: [
                { text: '欣然接受', icon: '😊', effect: '幸福+10 声望+5', fn: function() { mod({happy:10,fame:5}); addLog('一个小惊喜让你心情大好','good'); }},
                { text: '保持低调', icon: '🤫', effect: '精力+5', fn: function() { mod({energy:5}); addLog('低调处理，继续专注',''); }}
            ]
        });
    }

    // Burnout check
    if (G.stress >= 80 && G.energy <= 30 && chance(60)) {
        events.push({
            emoji: '🔥', title: '身体发出警告',
            desc: '连续高压工作导致你严重失眠、头痛，身体已经在抗议了...',
            choices: [
                { text: '休息一段时间', icon: '🛌', effect: '精力+30 压力-30 幸福+10', fn: function() { mod({energy:30,stress:-30,happy:10}); addLog('休息了一个月，终于恢复了','good'); }},
                { text: '硬撑，不能停', icon: '💊', effect: '压力+10 精力-10 幸福-15', fn: function() { mod({stress:10,energy:-10,happy:-15}); G.burnout=true; addLog('强撑着继续...身体更差了','bad'); }}
            ]
        });
    }

    return events.length > 0 ? events[rand(0, events.length - 1)] : null;
}

// ==================== Game Flow ====================
function startGame() {
    var name = document.getElementById('playerName').value.trim() || '科研小白';
    var field = document.getElementById('playerField').value;
    G.name = name;
    G.field = field;
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    addLog('【' + name + '】进入' + field + '专业，大学生活开始了！', 'good');
    nextTurn();
}

function nextTurn() {
    G.turnCount++;
    // Check game end
    if (G.stage >= 10 || G.year >= 2070 || G.stage === 99 || (G.energy <= 0 && G.stress >= 90)) {
        endGame();
        return;
    }

    // Stage progression
    if (G.turnCount > 1) {
        G.year++;
        G.age++;
        // Auto progress through stages
        if (G.stage <= 3) {
            G.stage++;
            // After undergrad, check if continuing
            if (G.stage === 4 && !G.hasMaster) {
                G.stage = 99; // ended - went to work
                endGame();
                return;
            }
        } else if (G.stage === 4 && G.turnCount > 6) {
            if (G.hasPhd) G.stage = 5; // already direct PhD
            else if (G.papers >= 1 && G.intel >= 60 && chance(70)) { G.hasPhd = true; G.stage = 5; addLog('考上了博士！继续深造','good'); }
            else { G.stage = 6; addLog('硕士毕业！','good'); checkAchievement('master','硕士毕业','🎓'); }
        } else if (G.stage === 5 && G.turnCount > 10) {
            G.stage = 6; addLog('博士毕业！','good'); checkAchievement('phd','博士帽','🎓');
        } else if (G.stage === 6 && G.turnCount > 12) {
            G.stage = 7; addLog('入职高校，成为讲师！','good');
        } else if (G.stage === 7 && G.turnCount > 15 && G.papers >= 5 && G.fame >= 30) {
            G.stage = 8; addLog('评上副教授了！','good'); checkAchievement('assoc_prof','副教授','👨‍🏫');
        } else if (G.stage === 8 && G.turnCount > 19 && G.topPapers >= 2 && G.fame >= 50 && G.funding >= 50) {
            G.stage = 9; addLog('晋升教授！！','good'); checkAchievement('professor','教授','🏅');
        } else if (G.stage === 9 && G.turnCount > 23 && G.fame >= 80 && G.topPapers >= 5) {
            G.stage = 10; addLog('获得杰出学者称号！学术巅峰！','good');
        }
    }

    // Natural stat changes
    mod({ energy: rand(-5, 5), stress: rand(-3, 5) });
    if (G.partner) mod({ happy: 3, stress: -2 });
    if (G.burnout) mod({ energy: -5, happy: -3 });

    updateUI();
    showEvent(getEvents());
}

function showEvent(event) {
    if (!event) { nextTurn(); return; }

    document.getElementById('eventEmoji').textContent = event.emoji;
    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('eventDesc').textContent = event.desc;

    var choicesEl = document.getElementById('choices');
    choicesEl.innerHTML = '';
    event.choices.forEach(function(c) {
        var btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = '<span class="choice-icon">' + c.icon + '</span><div><div class="choice-text">' + c.text + '</div><div class="choice-effect">' + c.effect + '</div></div>';
        btn.onclick = function() {
            c.fn();
            updateUI();
            setTimeout(nextTurn, 300);
        };
        choicesEl.appendChild(btn);
    });

    // Animate
    document.getElementById('eventCard').style.animation = 'none';
    setTimeout(function() { document.getElementById('eventCard').style.animation = 'fadeIn 0.4s ease'; }, 10);
}

function updateUI() {
    document.getElementById('statYear').textContent = G.year;
    document.getElementById('statStage').textContent = STAGES[Math.min(G.stage, 10)] || '社会人';
    document.getElementById('statPapers').textContent = G.papers;
    document.getElementById('statMoney').textContent = G.money;

    var bars = [
        ['Intel', G.intel], ['Energy', G.energy], ['Social', G.social],
        ['Stress', G.stress], ['Fame', G.fame], ['Happy', G.happy]
    ];
    bars.forEach(function(b) {
        var el = document.getElementById('bar' + b[0]);
        var num = document.getElementById('stat' + b[0]);
        if (el) el.style.width = b[1] + '%';
        if (num) num.textContent = b[1];
    });
}

function toggleLog() {
    var content = document.getElementById('logContent');
    var icon = document.getElementById('logToggleIcon');
    content.classList.toggle('open');
    icon.textContent = content.classList.contains('open') ? '▲' : '▼';
    // Render log
    content.innerHTML = G.log.slice().reverse().map(function(l) {
        return '<div class="log-item"><span class="log-year">[' + l.year + ']</span> <span class="log-' + l.type + '">' + l.text + '</span></div>';
    }).join('');
}

function endGame() {
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('endScreen').classList.add('active');

    // Calculate final title
    var title = '社会人';
    var desc = '';
    if (G.stage >= 10) { title = '学术泰斗'; desc = '你站在了学术的巅峰，一生都献给了科学事业。'; }
    else if (G.stage >= 9) { title = '知名教授'; desc = '你是学术界的中坚力量，桃李满天下。'; }
    else if (G.stage >= 8) { title = '副教授'; desc = '你在学术道路上稳步前行，未来可期。'; }
    else if (G.stage >= 7) { title = '高校教师'; desc = '教书育人，虽然平凡但很充实。'; }
    else if (G.stage >= 5) { title = '科研工作者'; desc = '在科研的道路上探索，虽未达到巅峰但始终在路上。'; }
    else if (G.money >= 50) { title = '商业精英'; desc = '离开了学术圈，但在商业领域闯出了一片天。'; }
    else if (G.happy >= 80) { title = '人生赢家'; desc = '也许没有论文等身，但你过得很幸福。'; }
    else { title = '平凡但真实'; desc = '人生不只有科研，你过了属于自己的生活。'; }

    document.getElementById('endCard').innerHTML =
        '<h3>' + G.name + '</h3>' +
        '<div class="end-title-badge">' + title + '</div>' +
        '<p style="margin-top:1rem">' + desc + '</p>' +
        '<p style="margin-top:0.5rem;font-size:0.85rem;color:#888">' + G.field + ' · ' + G.year + '年 · ' + G.age + '岁</p>';

    document.getElementById('endStats').innerHTML =
        '<div class="end-stat"><div class="end-stat-num">' + G.papers + '</div><div class="end-stat-label">论文</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.topPapers + '</div><div class="end-stat-label">顶刊</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.funding + '万</div><div class="end-stat-label">科研经费</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.students + '</div><div class="end-stat-label">培养学生</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.patents + '</div><div class="end-stat-label">专利</div></div>' +
        '<div class="end-stat"><div class="end-stat-num">' + G.money + '万</div><div class="end-stat-label">积蓄</div></div>';

    var achHtml = '<h4>🏅 成就</h4>';
    if (G.achievements.length === 0) achHtml += '<p style="color:#666;font-size:0.85rem">暂无成就</p>';
    G.achievements.forEach(function(a) {
        achHtml += '<div class="achievement"><span class="ach-icon">' + a.icon + '</span> ' + a.name + '</div>';
    });
    document.getElementById('endAchievements').innerHTML = achHtml;
}

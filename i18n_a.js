/* ===== i18n: English <-> Traditional Chinese (runtime text translation) ===== */
(function(){
var LANG='en';try{LANG=localStorage.getItem('gsa_lang')||'en'}catch(e){}
window.LANG_GET=function(){return LANG};

/* ---- terms ---- */
var TN={'strike spot':'擊球點位置','strike spot (centeredness)':'擊球點位置','strike height':'擊球點高低','face angle':'桿面角度','club path':'桿頭路徑','face to path':'桿面與路徑夾角','attack angle':'入射角','dynamic loft':'動態仰角','club speed':'桿頭速度','spin loft':'倒旋角','swing direction':'揮桿方向','low point distance':'最低點位置','low point':'最低點位置','swing plane':'揮桿平面','swing radius':'揮桿半徑','launch direction':'發射方向','launch angle':'發射角','spin rate':'轉速','spin axis':'旋轉軸','carry':'飛行距離','apex':'最高點','landing angle':'落地角','curve':'球路弧度','dispersion':'落點分散','smash factor':'擊球效率','ball speed':'球速','offline':'左右偏差','landing':'落點','direction':'方向','height':'高度','distance':'距離'};
function tn(s){var k=String(s).toLowerCase();return TN[k]||s}
var SIDE={left:'左',right:'右'};
function side(s){return SIDE[s]||s}
var SHAPE={Straight:'直球',Draw:'Draw',Fade:'Fade',Slice:'Slice',Hook:'Hook',Push:'Push',Pull:'Pull','Push draw':'Push draw','Pull fade':'Pull fade','Right miss':'右側失誤','Left miss':'左側失誤','On target':'落在目標上'};
var SPIN={'draw spin':'Draw 旋轉','fade spin':'Fade 旋轉','straight spin':'直線旋轉'};
var HGT={low:'偏低',medium:'中等',high:'偏高'};
var LVN={'Beginner':'初學者','20+ handicap':'20+ 差點','10–19 handicap':'10–19 差點','Single digit':'個位數差點','Tour level':'職業球員'};
var CLUBPAT=[[/^(\d) iron$/i,function(m){return m[1]+' 號鐵桿'}],[/^(\d) wood$/i,function(m){return m[1]+' 號木桿'}],[/^(\d) hybrid$/i,function(m){return m[1]+' 號混合桿'}],[/^driver$/i,function(){return '開球木桿'}],[/^pw$/i,function(){return 'PW 挖起桿'}],[/^gw$/i,function(){return 'GW 挖起桿'}],[/^aw$/i,function(){return 'AW 挖起桿'}],[/^sw$/i,function(){return 'SW 挖起桿'}],[/^lw$/i,function(){return 'LW 挖起桿'}]];
function club(s){for(var i=0;i<CLUBPAT.length;i++){var m=String(s).trim().match(CLUBPAT[i][0]);if(m)return CLUBPAT[i][1](m)}return EX[s]||s}
var N='(-?[+\\u2212\\-]?\\d+(?:\\.\\d+)?)';

/* ---- exact strings ---- */
var EX={
'Too much data?':'數據太多、看不懂？','We turn it into insight.':'我們把它變成洞察。',
'Upload 10 screenshots of your shot data and we’ll tell you exactly what to work on next.':'上傳 10 張你的擊球數據截圖，我們會告訴你接下來該改進什麼。',
'Tap or drag screenshots here':'點選或拖曳截圖到這裡',
'Up to 10 images · Trackman, GSPro, Garmin, Foresight, any launch monitor':'最多 10 張圖片 · Trackman、GSPro、Garmin、Foresight 等任何擊球監測儀',
'Quick setup':'快速設定','(the defaults are fine if you’re not sure)':'（不確定的話，用預設值就可以）',
'Handicap':'差點','0–9 handicap':'0–9 差點','10–19 handicap':'10–19 差點','20+ handicap':'20+ 差點','Beginner':'初學者',
'Swing':'揮桿','Right-handed':'右手球員','Left-handed':'左手球員','Club':'球桿','Choose a club':'選擇球桿',
'Driver':'開球木桿','Fairway wood':'球道木桿','Hybrid':'混合桿','Long iron (3–4)':'長鐵桿（3–4 號）','Mid iron (5–7)':'中鐵桿（5–7 號）','Short iron (8–PW)':'短鐵桿（8 號–PW）','Wedge':'挖起桿','Mixed clubs':'多支球桿',
'Goal':'目標','Hit my normal shot':'打我平常的球','A specific ball flight':'特定的球路','Shape':'球路形狀','Any':'不限','Straight':'直球','Draw':'Draw','Fade':'Fade',
'Height':'高度','Low':'低','Mid':'中','High':'高',
'What’s your handicap level?':'你的差點水準是？','Single digit (0–9)':'個位數（0–9）','About 10':'約 10','About 20':'約 20','Beginner / new to golf':'初學者 / 剛接觸高爾夫','Not sure':'不確定',
'No exact number needed. This only sets how strict the targets are.':'不需要精確數字，這只是用來決定目標的嚴格程度。',
'Which hand do you swing with?':'你用哪一手揮桿？','What club are you using?':'你用的是哪支球桿？','Pick “Mixed clubs” if your screenshots show several clubs.':'如果截圖裡有好幾支球桿，請選「多支球桿」。',
'What are you trying to do?':'你想做到什麼？','Hit my normal shot at the target':'打我平常的球，瞄準目標','Hit a specific ball flight':'打出特定的球路','Just analyze, I’m not sure':'先分析就好，我不確定',
'Shot shape (optional)':'球路形狀（可不選）','Height (optional)':'球彈道高度（可不選）',
'Analyze my game →':'分析我的球 →','Thinking it through…':'分析中…','Following the same steps a golf pro would.':'依照球場教練會用的相同步驟。','Reading your shots…':'正在讀取你的擊球…','This can take a minute or two.':'這可能需要一兩分鐘。',
'Your game,':'你的球技，','decoded':'完整解讀','New to golf data?':'第一次看高爾夫數據？','Tap any':'點選任何','underlined term':'有底線的詞','to see what it means in plain English.':'就能看到白話解釋。',
'✅ What you do well':'✅ 你做得好的地方','💪 These are real strengths. Nice work, this is a great base to build on.':'💪 這些是你真正的優點，做得很好，這是很棒的基礎。',
'What to work on':'接下來要改進的','Good news: just one thing to focus on.':'好消息：只需要專注在一件事。',
'The numbers:':'數據：','Why it matters:':'為什麼重要：','🎯 Your goal:':'🎯 你的目標：','Let’s break it down':'一步步拆解',
'Where your shots landed':'你的球落在哪裡','Target line':'目標線',
'Shaded zone':'陰影區',
'Hover over or tap a dot to see what kind of shot it was.':'將滑鼠移到圓點上或點一下，可以看到那一球的類型。',
'Oval = the area that holds all of your shots. The smaller the oval, the tighter your group.':'橢圓 = 涵蓋你所有球的區域。橢圓越小，球越集中。',
'What your shots are telling us':'你的球告訴我們什麼',
'🧭 Where it starts':'🧭 起飛方向','↪️ How it curves':'↪️ 球路弧度','🎯 Where it finishes':'🎯 落點','📈 How high it flies':'📈 彈道高度',
'On track':'達標','Consistency problem':'穩定度問題','Pattern problem':'固定問題','Pattern and consistency problem':'固定與穩定度問題','Just observing':'僅供觀察',
'Direction':'方向','Distance':'距離','Average carry:':'平均飛行距離：','Your ball flight height':'你的彈道高度','usual height for this club':'這支球桿的一般高度',
'Flight height is just right':'彈道高度剛好','Flight height just right':'彈道高度剛好','Your ball flight is a bit high':'你的球飛得有點高','Your ball flight is a bit low':'你的球飛得有點低','Flies a bit low':'飛得有點低','Flies a bit high':'飛得有點高',
'Steady height':'高度穩定','Height varies a little':'高度略有變化','Height varies quite a bit':'高度變化較大',
'Impact factors consistency':'擊球因素的穩定度','From result to cause':'從結果找原因',
'The numbers that went over their limit are marked below.':'超出上限的數字會標在下方。',
'Average:':'平均：','Consistency:':'穩定度：','Excellent':'優秀','Good':'良好','Fair':'尚可','Needs work':'待加強','Not shown':'未顯示','Excellent ':'優秀',
'Steady, but off target':'穩定，但偏離目標',
'Strike spot':'擊球點位置','Club speed':'桿頭速度','Face angle':'桿面角度','Club path':'桿頭路徑','Face to path':'桿面與路徑夾角','Dynamic loft':'動態仰角','Attack angle':'入射角','Spin loft':'倒旋角',
'Swing direction':'揮桿方向','Low point distance':'最低點位置','Swing plane':'揮桿平面','Swing radius':'揮桿半徑','Curve':'球路弧度','Landing':'落點',
'What do these mean?':'這些是什麼意思？','Possible causes to look at':'可以留意的可能原因','Clues, not proof.':'這些是線索，不是證據。','No club-level data detected.':'沒有偵測到桿頭層面的數據。',
'The ± number is your biggest miss from your own average, so smaller is steadier. Average shows where you are on average: steady is only good if the average is in the right place.':'± 數字是你離自己平均值最遠的一球，所以數字越小越穩定。平均值顯示你平均的位置：穩定只有在平均值落在對的位置才算好。',
' One club speed outlier (a swing far off the rest) was left out.':' 有一次桿頭速度與其他差太多（一次異常的揮桿），已排除在外。',
' With several clubs, it shows your least steady club.':' 有多支球桿時，顯示最不穩定的那一支。',
'The ± number is your biggest miss from your own average, so smaller is steadier. Average shows where you are on average: steady is only good if the average is in the right place. With several clubs, it shows your least steady club.':'± 數字是你離自己平均值最遠的一球，所以數字越小越穩定。平均值顯示你平均的位置：穩定只有在平均值落在對的位置才算好。有多支球桿時，顯示最不穩定的那一支。',
'Glossary: what do these numbers mean?':'詞彙表：這些數字是什麼意思？','← Analyze new shots':'← 分析新的擊球','Got it':'知道了',
'Shot landing positions':'球的落點位置','Side view of ball flight':'球飛行的側視圖','Practice range view of your shots':'練習場視角的擊球',
'Your results are steady, so there is no problem to trace.':'你的結果很穩定，沒有需要追查的問題。',
'Your results match what you wanted and are steady, so there is no problem to trace.':'你的結果符合你的目標而且很穩定，沒有需要追查的問題。',
' The rings below still show how steady each number is.':' 下方的圓環仍然顯示每個數字有多穩定。',
'Your results are steady, so there is no problem to trace. The rings below still show how steady each number is.':'你的結果很穩定，沒有需要追查的問題。下方的圓環仍然顯示每個數字有多穩定。',
'Your results match what you wanted and are steady, so there is no problem to trace. The rings below still show how steady each number is.':'你的結果符合你的目標而且很穩定，沒有需要追查的問題。下方的圓環仍然顯示每個數字有多穩定。',
'No priorities this time':'這次沒有需要優先改進的項目','Your priority':'你的優先改進項目',
'Your numbers meet your goal. Keep doing what you are doing.':'你的數字達到目標，繼續保持。',
'Nothing needs fixing right now. Keep doing what you are doing, and run another set of shots after your next practice to check it holds.':'目前沒有需要修正的地方。繼續保持，下次練習後再分析一組球，確認狀態有維持。',
'We found nothing to fix in the data we could read, but we could not check everything, so share more shots next time.':'在我們讀得到的數據裡沒有發現需要修正的地方，但有些項目無法檢查，下次請提供更多球。',
'Please find a coach, or a club fitter if your equipment may be part of it, to help you improve these numbers. This report shows what to work on; a professional can show you how.':'請找教練（如果可能與球具有關，也可以找球桿調校師）幫你改善這些數字。這份報告告訴你該改進什麼，專業人士才能教你怎麼做。',
'🌱 You already have solid pieces in your game. A small, steady improvement here goes a long way, so be proud of what you did today and enjoy the next round.':'🌱 你的球技已經有很扎實的部分。在這裡一點一滴穩定進步就會有很大的幫助，為今天的努力感到驕傲，好好享受下一場球吧。',
'How sure are we?':'我們有多確定？','(tap to see)':'（點選查看）',
'Goal: No height goal (compared with the usual range)':'目標：沒有設定高度目標（與一般範圍比較）',
'Not enough landing data to judge direction':'落點數據不足，無法判斷方向',
'Direction, shape and distance':'方向、球路與距離','Face, path, attack angle and loft':'桿面、路徑、入射角與仰角','Against your club speed':'與你的桿頭速度比較','Repeating misses and shot-to-shot changes':'重複出現的失誤和每球之間的變化','Against your handicap level':'與你的差點水準比較',
'Evaluating your ball flight':'評估你的球飛行','Evaluating your club data':'評估你的桿頭數據','Checking flight height':'檢查彈道高度','Looking for patterns':'尋找固定的模式','Testing your impact factors':'檢驗你的擊球因素',
'Looking for a pattern or a consistency problem':'尋找固定問題或穩定度問題','Searching swing geometry for clues':'在揮桿軌跡中尋找線索','Choosing your top priorities':'挑選最優先的改進項目','Matching what we found to your goal':'把發現的結果對照你的目標',
'No height data in these numbers':'這些數字裡沒有高度數據','Results match your goal and are steady':'結果符合你的目標而且穩定','All steady for your level':'以你的水準來看都很穩定','Not enough impact data shown':'顯示的擊球數據不足','Nothing stands out in the swing movements':'揮桿動作中沒有特別突出的地方','Not needed, nothing is shaky':'不需要，沒有不穩定的項目',
'None detected':'沒有偵測到','Preparing your photos…':'正在處理你的照片…','Trying once more…':'再試一次…','Double-checking a height reading…':'再次確認高度數字…',
'AI analysis only runs when this page is opened inside Claude while signed in. A normal browser cannot run it yet.':'AI 分析只能在登入 Claude 後，從 Claude 裡開啟這個頁面才能執行。一般瀏覽器目前還不行。',
'AI analysis isn’t available in this view. Open the page from the Claude app while signed in.':'這個畫面無法使用 AI 分析。請登入後從 Claude App 開啟此頁面。',
'Image analysis isn’t enabled for this view.':'這個畫面未開啟圖片分析功能。',
'No shot data could be read from these screenshots.':'無法從這些截圖讀到任何擊球數據。',
'Not needed':'不需要','Choose a club to continue':'請先選擇球桿',' · choose a club to continue':' · 請先選擇球桿',
'EN':'EN','Good to know: ':'小提醒：',
'Shorter bar = more repeatable. Black line = goal for your level.':'長條越短 = 越穩定。黑線 = 你這個水準的目標。',
'How steady each one is, compared with players at your level.':'與你同水準的球員相比，每一項有多穩定。',
'How steady each of your important club data metrics is, compared with players at your level. Fuller bar = steadier.':'與你同水準的球員相比，每一項重要桿頭數據有多穩定。長條越滿 = 越穩定。',
'View from behind you. Curves are sketched from each shot’s start direction, landing spot and height. Green lane = on-target zone.':'從你身後看的視角。球路是依每一球的起飛方向、落點和高度畫出的示意圖。綠色區域 = 命中目標範圍。',
'Too few shots carried the same distance, so the distance is not steady.':'飛行距離一致的球太少，所以距離不穩定。',
'Goal: at least 7 of every 10 shots within ±5% of your average carry':'目標：每 10 球至少有 7 球落在平均飛行距離的 ±5% 以內',
'The amount of curve changes from shot to shot':'每一球的弧度大小都在變',
'Misses to the right':'向右失誤','Misses to the left':'向左失誤','Nicely on target':'很準地命中目標','Results are a bit all over the place':'結果有點分散','Mostly on target':'大多命中目標',
'Needs improvement':'需要改進','No usable shot data':'沒有可用的擊球數據',
'Reading screenshots':'正在讀取截圖','Language':'語言'
};
window.__I18N={EX:EX,TN:TN,tn:tn,N:N,SPIN:SPIN,SHAPE:SHAPE,HGT:HGT,LVN:LVN,side:side,club:club,
  get lang(){return LANG},set lang(v){LANG=v}};
})();

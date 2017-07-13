var paraJack = {
	boxes: new Array(16),
	//该数组每一项都是一个div元素引用,
	//索引i对应的div位置在方框中从上往下第Math.floor(i/4)+1行，从左往右第(i%4)+1列
	//在移动和折叠过程中，我们会先实现目标样式，这些方块的位置可能会有偏移以达到这个样式，但是移动折叠完成时，将会完全撤销它们的偏移，只不过会更新它们的数字（颜色随之改变）
	history: new Array(),
	//各位置方块历史数值,每项都是一个长度16的数组,最多容纳十个历史记录
	cmdLine: new Array(),
	//等待执行的折叠队列
	colors: {
		0: 'transparent',
		2: '#555',
		4: '#555',
		8: '#fff',
		16: '#fff',
		32: '#fff',
		64: '#fff',
		128: '#fff',
		256: '#fff',
		512: '#fff',
		1024: '#fff',
		2048: '#fff',
		4096: '#fff',
		8192: '#fff',
		16384: '#fff'
	},

	//rgba(230,230,230,0.5)

	bgColors: {
		0: 'transparent',
		2: 'rgba(230,230,230,0.5)',
		4: 'rgba(230,230,230,0.5)',
		8: 'rgba(0,136,0,0.3)',
		16: 'rgba(3,169,244,0.3)',
		32: 'rgba(3,169,244,0.6)',
		64: 'rgba(3,169,244,0.9)',
		128: 'rgba(222,125,44,1)',
		256: 'rgba(220,87,18,1)',
		512: 'rgba(213,26,33,1)',
		1024: 'rgba(153,9,181,0.7)',
		2048: 'black',
		4096: 'black',
		8192: 'black',
		16384: 'black'
	},
	width: 120,
	gap: 6,
	timeStep: 10,
	lenStep: 20,
	record: 0,
	lineIsOk: [true,true,true,true],
	isCmdOn: false,
	isMoving: false
};

$(document).ready(function(){
	initGame();
});

function initGame(){
	appendDivs();
	resetAllDivs();
	setListener();
	handleCmdLine();
}
function appendDivs(){
	var div = paraJack.boxes,
		width = paraJack.width,
		gap = paraJack.gap,
		boxes = document.getElementById("boxes");
	for(var i = 0; i < 16; i++){
		div[i] = document.createElement('div');
		div[i].className = 'box';
		div[i].style.left = (gap + (width + gap) * (i%4)) + 'px';
		div[i].style.top = (gap + (width + gap) * (Math.floor(i/4))) + 'px';
		boxes.appendChild(div[i]);
	}
}
function handleCmdLine(){
	if(paraJack.lineIsOk[0] && paraJack.lineIsOk[1] && paraJack.lineIsOk[2] && paraJack.lineIsOk[3] && paraJack.cmdLine.length > 0){
		//上次任务已完成且任务队列非空，则执行任务
		paraJack.isCmdOn = true;
		cmd = paraJack.cmdLine.shift();
		paraJack.lineIsOk = [false,false,false,false];
		//各行/列是否完成折叠的标识，
		//对4行/列调用foldOneLine时，最后一个参数分别是0，1，2，3
		//如果某一行/列完成折叠，会在foldOneLine内部将对应索引的值切换为true
		switch(cmd){
			case 'left':
				updateHistory(getAllDivsNum());
				foldOneLine(0,1,2,3,'left',0);
				foldOneLine(4,5,6,7,'left',1);
				foldOneLine(8,9,10,11,'left',2);
				foldOneLine(12,13,14,15,'left',3);
				paraJack.isMoving = true;
				break;
			case 'right':
				updateHistory(getAllDivsNum());
				foldOneLine(3,2,1,0,'right',0);
				foldOneLine(7,6,5,4,'right',1);
				foldOneLine(11,10,9,8,'right',2);
				foldOneLine(15,14,13,12,'right',3);
				paraJack.isMoving = true;
				break;
			case 'top':				
				updateHistory(getAllDivsNum());
				foldOneLine(0,4,8,12,'top',0);
				foldOneLine(1,5,9,13,'top',1);
				foldOneLine(2,6,10,14,'top',2);
				foldOneLine(3,7,11,15,'top',3);
				paraJack.isMoving = true;
				break;
			case 'bottom':
				updateHistory(getAllDivsNum());
				foldOneLine(12,8,4,0,'bottom',0);
				foldOneLine(13,9,5,1,'bottom',1);
				foldOneLine(14,10,6,2,'bottom',2);
				foldOneLine(15,11,7,3,'bottom',3);
				paraJack.isMoving = true;
				break;
			case 'reset':
				paraJack.history = [];
				resetAllDivs();
				paraJack.lineIsOk = [true,true,true,true];
				paraJack.isMoving = false;
				break;
			case 'back':
				if(paraJack.history.length > 0){
					setAllDivs(paraJack.history.pop());
				}
				paraJack.lineIsOk = [true,true,true,true];
				paraJack.isMoving = false;
				break;
			default:
				paraJack.lineIsOk = [true,true,true,true];
				paraJack.isMoving = false;
				break;
		}
	}
	var checkFinished = function(){
			if(paraJack.lineIsOk[0] && paraJack.lineIsOk[1] && paraJack.lineIsOk[2] && paraJack.lineIsOk[3]){
				//上次命令已经完成
				if(paraJack.isCmdOn){
					if(paraJack.isMoving){
						addOneDiv();
						paraJack.isMoving = false;					
					}
					paraJack.isCmdOn = false;
				}
				handleCmdLine();
			}else{
				//有命令正在进行
				setTimeout(checkFinished,10);
			}
		};
	setTimeout(checkFinished,10);
}
function resetAllDivs(){
	var arr = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
	setAllDivs(arr);
	paraJack.history = [];
}
function setAllDivs(arr){
	var i = 0,
		width = paraJack.width,
		gap = paraJack.gap,
		divs = paraJack.boxes;
	for(i = 0; i < arr.length;i++){
		var left = gap + (gap + width) * (i%4),
			top = gap + (gap + width) * Math.floor(i/4);
		setOneDiv(divs[i],arr[i],left,top);
	}
}
function getAllDivsNum(){
	var arr = new Array(16),
		i = 0,
		divs = paraJack.boxes;
	for(i = 0; i < 16; i++){
		arr[i] = parseInt(divs[i].innerHTML);
	}
	return arr;
}
function foldOneLine(divIndex1,divIndex2,divIndex3,divIndex4,dire,lineNum){
/*============
功能：折叠一行/列
前四个参数为该行/列四个div在paraJack.boxes中的索引(0-15)
按照divIndex4对应div向divIndex1对应div方向压缩，
在UI中实际压缩方向用字符串dire表示('left','top','right','bottom')
lineNum是调用函数传入的一个行/列标记(0,1,2,3)
完成折叠后将paraJack.lineIsOk[lineNum]设为true，代表该行已经折叠成功
==============*/ 
	var boxes = paraJack.boxes,
		div =[
				boxes[divIndex1],
				boxes[divIndex2],
				boxes[divIndex3],
				boxes[divIndex4]
			],

		//保存方块初始偏移位置 
		pos = {
			left: [parseInt(div[0].style.left),parseInt(div[1].style.left),parseInt(div[2].style.left),parseInt(div[3].style.left)],
			top: [parseInt(div[0].style.top),parseInt(div[1].style.top),parseInt(div[2].style.top),parseInt(div[3].style.top)]
		},

		//需要被覆盖翻倍的方块的索引
		foldPos =3,

		styleStr = (dire === 'left' || dire === 'right')?'left':'top',
		incSign = (dire === 'left' || dire === 'top')?-1:1,
		lenStep = paraJack.lenStep,
		timeStep = paraJack.timeStep,		
		lenSum = 0,
		lenSumGoal = (paraJack.width+paraJack.gap),
		progress = 0,
		i = 0;

	//standardlize标准化过程（压缩掉所有空方块（数值为0））参数
	var stZeroSum = [0,0,0,0],	//索引i对于值为前i+1个中空方块的个数
		stTargetNum = [0,0,0,0],	//标准化完成时，各方块的数值
		stLenSum = [0,0,0,0],	//移动过程中各方块css偏移量增加值累计
		stLenSumGoal = [0,0,0,0],	//移动过程终点各方块css偏移量增加值
		stSpeedUp = 1,	//相对折叠过程，标准化过程加速倍数
		stBoxIsOk = [false,false,false,false],	//各方块是否到达移动过程终点
		stIsOk  =false;	//是否已完成标准化过程

	//初始化标准化过程参数
	stZeroSum[0] = Number(parseInt(div[0].innerHTML) === 0);
	stZeroSum[1] = Number(parseInt(div[1].innerHTML) === 0) + stZeroSum[0];
	stZeroSum[2] = Number(parseInt(div[2].innerHTML) === 0) + stZeroSum[1];
	stZeroSum[3] = Number(parseInt(div[3].innerHTML) === 0) + stZeroSum[2];
	for(i = 0; i < 4; i++){
		if(stZeroSum[i] >= 1){
			stLenSumGoal[i] = (paraJack.gap + paraJack.width) * (stZeroSum[i]);
		}
		stTargetNum[i] = parseInt(div[i].innerHTML);
	}
	stTargetNum = stTargetNum.filter(function(item,index,array){
		return item !== 0;
	}).concat([0,0,0,0]).slice(0,4);

	var	standardlize = function(){
		//标准化过程函数
			for(i = 0;i<4;i++){
				if(!stBoxIsOk[i]){
					//如果一个方块还未完成移动
					if(stLenSumGoal[i] > 0){
						if((stLenSum[i] += lenStep * stSpeedUp) <= stLenSumGoal[i]){
							//一步之内无法完成移动
							div[i].style[styleStr] = (pos[styleStr][i]+ stLenSum[i] * incSign) + 'px';
						}else{
							//移动到目标位置，保存已完成状态
							div[i].style[styleStr] = (pos[styleStr][i] + stLenSumGoal[i] * incSign) + 'px';
							stBoxIsOk[i] = true;
						}
					}else{
						stBoxIsOk[i] = true;
					}					
				}
			}
			if(!(stBoxIsOk[0] && stBoxIsOk[1] && stBoxIsOk[2] && stBoxIsOk[3])){
				//存在方块还未完成
				setTimeout(standardlize,timeStep);
			}else{
				//所有方块移动到了指定位置，此时让所有方块恢复到初始位置，
				//不过要更新各方块内部数字
				for(i = 0;i<4;i++){
					setOneDiv(div[i],stTargetNum[i],pos.left[i],pos.top[i]);	
				}
				stIsOk = true;
			}
		},
		foldOnce = function(){
			if((lenSum += lenStep) < lenSumGoal){
				for(var i = foldPos + 1;i < 4; i++){
					var style = div[i].style;
					style[styleStr] = (parseInt(style[styleStr]) + 
						lenStep * incSign) + 'px';
				}
				setTimeout(foldOnce,timeStep);
			}else{
				setOneDiv(div[foldPos],parseInt(div[foldPos].innerHTML)*2,
					pos.left[foldPos],pos.top[foldPos]);
				for(var i = foldPos + 1;i < 3; i++){
					setOneDiv(div[i],parseInt(div[i+1].innerHTML),
						pos.left[i],pos.top[i]);
				}
				setOneDiv(div[3],0,pos.left[3],pos.top[3]);
				progress += 1;

				if(progress<3){
					//该行/列移动压缩次数不够3次，更新数据，可能的话再次压缩
					lenSum = 0;
					foldPos = (div[0].innerHTML === div[1].innerHTML && parseInt(div[0].innerHTML) !== 0) ? 0 :
						  (
							(div[1].innerHTML === div[2].innerHTML && parseInt(div[1].innerHTML) !== 0) ? 1 :
							(
								(div[2].innerHTML === div[3].innerHTML && parseInt(div[2].innerHTML) !== 0) ? 2: 3
							)
						  );
					if(foldPos < 3){
						//还能够压缩
						setTimeout(foldOnce,timeStep);					
					}else{
						paraJack.lineIsOk[lineNum] = true;
					}
				}else{
					paraJack.lineIsOk[lineNum] = true;
				}
			}
		},
		foldTest = function(){
			if(stIsOk){
				foldPos = (div[0].innerHTML === div[1].innerHTML && parseInt(div[0].innerHTML) !== 0) ? 0 :
						  (
							(div[1].innerHTML === div[2].innerHTML && parseInt(div[1].innerHTML) !== 0) ? 1 :
							(
								(div[2].innerHTML === div[3].innerHTML && parseInt(div[2].innerHTML) !== 0) ? 2: 3
							)
						  );
				if(foldPos < 3){
					//折叠，完成后会在函数内部将paraJack.lineIsOk[lineNum]设为true
					foldOnce();
				}else{
					//没有相邻非零重复项，不需折叠，该行折叠处理已完成
					paraJack.lineIsOk[lineNum] = true;
				}
			}else{
				setTimeout(foldTest,timeStep*5);
			}
		};
	standardlize();
	foldTest();
}
function setOneDiv(div,num,left,top){
	div.innerHTML = num;
	div.style.color = paraJack.colors[num.toString()];
	div.style.backgroundColor = paraJack.bgColors[num.toString()];
	div.style.left = left + 'px';
	div.style.top = top + 'px';
	if(num === 0){
		div.style.display = 'none';
	}else{
		div.style.display = 'block';
	}
}
function addOneDiv(){
	var zeroDivIndex = new Array(),
		len = 0,
		boxes = paraJack.boxes,
		newDiv = null,
		maxNum = 0;
	for(var i = 0; i < 16; i++){
		var num = parseInt(boxes[i].innerHTML);
		if(num === 0){
			zeroDivIndex.push(i);
		}
		maxNum = (num>maxNum)?num:maxNum;
	}
	len = zeroDivIndex.length;
	if(len > 0){
		newDiv = boxes[zeroDivIndex[getRandomIntTJK(0,len-1)]];
		setOneDiv(newDiv,getRandomIntTJK(1,2)*2,parseInt(newDiv.style.left),parseInt(newDiv.style.top));
	}else{
		if(maxNum > paraJack.record){
			paraJack.record = maxNum;
		}
		alert('No more space!\nYou get ' + maxNum + ', good work!');
	}
}
function setListener(){
	$('input').click(function(event){	
		pushCmd(this.id);		
	});
	$(document).keyup(function(event){
		var dire = '';
		switch(event.keyCode){
			case 37:
			case 65:
				dire = 'left';
				break;
			case 38:
			case 87:
				dire = 'top';
				break;
			case 39:
			case 68:
				dire = 'right';
				break;
			case 40:
			case 83:
				dire = 'bottom';
				break;
			case 82:
				dire = 'reset';
				break;
			case 66:
				dire = 'back';
				break;
		}
		if(!!dire){
			pushCmd(dire);			
		}
	});
	$('button#intro').click(function(){
		$('div.intro')[0].style.display = 'block';
	});
	$('div.intro').click(function(){
		this.style.display = 'none';
	});
}
function pushCmd(dire){
	paraJack.cmdLine.push(dire);
}
function updateHistory(arr){
	if(paraJack.history.length <= 9){
		paraJack.history.push(arr);
	}else{
		paraJack.history.shift().push(arr);
	}
}
function getRandomIntTJK(minNum,maxNum){
	if(typeof minNum === "number" && typeof maxNum === "number"){
		var min = parseInt(minNum),
			max = parseInt(maxNum);
		return Math.floor(Math.random()*(max-min+1)) + min;
	}
}


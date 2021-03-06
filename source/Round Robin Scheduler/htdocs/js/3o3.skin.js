_3o3.Skin = new Class({
	Implements: [Chain,Options],
	options:{},
	initialize: function(element, controller, options){
		this.setOptions(options);
		this.element=element;
		this.controller=controller;
		// status bar
		this.statusBar=new Element('div',{'id':'_3o3_status'});
		this.statusBar.hide();
		this.statusBar.scorekeeper=new Element('div',{'id':'_3o3_status__scorekeeper'});
		this.statusBar.round=new Element('div',{'id':'_3o3_status__round'});
		this.statusBar.court=new Element('div',{'id':'_3o3_status__court'});
		
		this.statusBar.done=new Element('button',{'id':'_3o3_status__done','text':'Done'});
		this.statusBar.done.hide();
		
		this.statusBar.back=new Element('button',{'id':'_3o3_status__back','text':'Back'});
		this.statusBar.back.hide();
		
		this.statusBar.schedule=new Element('button',{'id':'_3o3_status__schedule','text':'Schedule'});
		this.statusBar.schedule.hide();
		
		this.statusBar.adopt(this.statusBar.scorekeeper,this.statusBar.schedule,this.statusBar.round,this.statusBar.court,this.statusBar.done,this.statusBar.back);
		
		
		
		this.accessCodeMessage = new Element('div',{'id':'_3o3_access_code_message'});
		
		this.scheduleDisplay = new _3o3.Schedule(new Element('div',{'id':'_3o3_schedule_display'}),controller);
		this.scheduleDisplay.hide();
		
		this.currentGameDisplay = new _3o3.GameEditor(new Element('div',{'id':'_3o3_current_game'}),controller);
		this.currentGameDisplay.hide();
		
		// events
		this.currentGameDisplay.addEvent(this.currentGameDisplay.events.showEditDisplay,this.statusBar.done.show.bind(this.statusBar.done));
		this.currentGameDisplay.addEvent(this.currentGameDisplay.events.showEditDisplay,this.scheduleDisplay.hide.bind(this.scheduleDisplay));	
		this.currentGameDisplay.addEvent(this.currentGameDisplay.events.hideEditDisplay,this.statusBar.done.hide.bind(this.statusBar.done));
		this.currentGameDisplay.addEvent(this.currentGameDisplay.events.showConfirmDisplay,this.statusBar.back.show.bind(this.statusBar.back));
		this.currentGameDisplay.addEvent(this.currentGameDisplay.events.hideConfirmDisplay,this.statusBar.back.hide.bind(this.statusBar.back));
		this.currentGameDisplay.addEvent(this.currentGameDisplay.events.confirmCompleted,this.handleGameDataConfirmCompleted.bind(this));
		
		this.currentGameDisplay.addEvent(this.currentGameDisplay.events.show,
			function(){
				if(this.currentGameDisplay.currentView==this.currentGameDisplay.views.edit)this.statusBar.done.show();
				if(this.currentGameDisplay.currentView==this.currentGameDisplay.views.confirm)this.statusBar.back.show();
			}.bind(this));
		this.currentGameDisplay.addEvent(this.currentGameDisplay.events.hide,
			function(){
				this.statusBar.done.hide();
				this.statusBar.back.hide();
			}.bind(this));
		
		this.scheduleDisplay.addEvent(this.scheduleDisplay.events.show,
			function(){
				this.statusBar.court.hide();
				this.statusBar.round.hide();
				this.statusBar.schedule.hide();
				this.currentGameDisplay.hide();
				this.controller.setGame(null);
			}.bind(this));
		this.scheduleDisplay.addEvent(this.scheduleDisplay.events.hide,this.statusBar.schedule.show.bind(this.statusBar.schedule));
		this.scheduleDisplay.addEvent(this.scheduleDisplay.events.startCourtRoundClicked,this.manualStartGame.bind(this));
			
		this.statusBar.schedule.addEvent('click',this.scheduleDisplay.show.bind(this.scheduleDisplay));
		this.statusBar.done.addEvent('click',this.currentGameDisplay.showConfirmDisplay.bind(this.currentGameDisplay));
		this.statusBar.back.addEvent('click',this.currentGameDisplay.showEditDisplay.bind(this.currentGameDisplay));
		
		this.element.adopt(this.statusBar,this.accessCodeMessage,this.scheduleDisplay.element,this.currentGameDisplay.element);
		
		controller.addEvent(controller.events.accessCodeChanged,this.setAccessCode.bind(this));
		controller.addEvent(controller.events.stringsChanged,this.setStrings.bind(this));
		controller.addEvent(controller.events.scoreKeeperDataChanged,this.setScoreKeeperData.bind(this));
		controller.addEvent(controller.events.gameChanged,this.setGame.bind(this));
		if(controller.accessCode!=null) setAccessCode(controller.accessCode);
		
		window.addEvent('resize',this.refreshSizing.bind(this));
		window.addEvent('load',this.refreshSizing.bind(this));
	},
	refreshSizing:function(){
		var windowWidth=window.innerWidth;
		var windowHeight=window.innerHeight;
		var fontSize=Math.min(windowWidth/18.5,windowHeight/9);
		this.element.style.fontSize=fontSize+'px';
	},
	handleGameDataConfirmCompleted:function(){
		this.controller.getCurrentGame(this.setGame.bind(this));
	},
	setScoreKeeperData:function(scoreKeeperData){
		if(this.scoreKeeperData!=null&&scoreKeeperData==null)location.reload(true);
		this.scoreKeeperData=scoreKeeperData;
		if(scoreKeeperData==null)return;
		
		this.statusBar.show();
		this.accessCodeMessage.hide();
		this.statusBar.scorekeeper.set('html',scoreKeeperData.Name);
	},
	setAccessCode:function(accessCode){
		if(this.controller.strings==null){
			this.controller.addEvent(this.controller.events.stringsChanged+':once',this.setAccessCode.pass(accessCode,this));
			return;
		}
		if(this.controller.strings.AccessCodeMessageLine1!=null)
			this.accessCodeMessage.grab(new Element('div',{
				'html':this.controller.strings.AccessCodeMessageLine1.format(accessCode),
				'class':'_3o3_access_code_message__line_1'}));
		if(this.controller.strings.AccessCodeMessageLine2!=null)
			this.accessCodeMessage.grab(new Element('div',{
				'html':this.controller.strings.AccessCodeMessageLine2.format(accessCode),
				'class':'_3o3_access_code_message__line_2'}));
	},
	setStrings: function(strings){
		if(strings.TournamentName!=null)document.title = strings.TournamentName;
	},
	manualStartGame:function(id){
		this.controller.getGame(id);
	},
	setGame:function(gameData){
		if(gameData==null||this.currentGameDisplay.element.isVisible())return;
	
		if(gameData.NotAssigned||gameData.GameCompleted){
			//Show the schedule
			if(!this.scheduleDisplay.element.isVisible())this.scheduleDisplay.show();	
		}
		else{
			//Show the current game
			this.statusBar.court.show();
			this.statusBar.round.show();
			this.statusBar.court.set('html',gameData.CourtLetter);
			this.game = gameData;
			this.currentGameDisplay.setGame(gameData);
		}
		this.statusBar.round.set('html',gameData.CourtRoundNum);
	}
});
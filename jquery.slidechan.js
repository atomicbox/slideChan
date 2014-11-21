/*////////////////////////////////////////////////////////////////////
SlideChan - jQuery plugin (ver.1.11.1)
http://www.jquery.com
Version: 1.0

Copyright 2014 atomicbox http://atomicbox.tank.jp/
Licensed under the Creative Commons Attribution 2.1 License
http://creativecommons.org/licenses/by-nc-nd/2.1/jp/
////////////////////////////////////////////////////////////////////*/
;(function($) {
	
	/* パラメータ定義：デフォルト値 */
	var defaults = {
			slideSpeed: 500,
			contentsSlideShowMode: false,
			frameSelector: '.slideChan-frame',
			naviPrevSelector: '',
			naviNextSelector: '',
			naviButtonUse: true,
			naviButtonSelector: '',
			naviButtonPosition: 'inner'
	}

	var userAgent = window.navigator.userAgent.toLowerCase();
	var appVersion = window.navigator.appVersion.toLowerCase();
	
	$.fn.slideChan = function(options) {
		
		/* 内部パラメータ定義 */
		var self = this;
		var entity = {};	// 内部設定セット
		self.setupCompleteFlg = false;
		self.preloadCompleteFlg = false;
		self.loadTimerID;

		/* function ::: 初期化コントロール */
		var initCtrl = function(){

			// パラメータ設定
			entity.settings = $.extend({}, defaults, options);
			
			// ローディング開始
			self.css('position','relative');
			entity.settings.loading = self.append('<div class="slideChan-loading">Loading</div>').find('.slideChan-loading');
			self.loadTimerID = setInterval(loadingCtrl, 500);
			
			// 画像のプリロード処理
			entity.loadImgLen = self.find('img').length;	// ローディング対象画像数
			preLoadCtrl();
			
			entity.settings.frames = self.find(entity.settings.frameSelector);
			entity.settings.framesLen = entity.settings.frames.length;	// frame枚数
			entity.settings.defaultNaviUse = true;
			entity.settings.defaultNaviButtonUse = true;
			
			setupCtrl();
		}

		/* function ::: DOM・CSSセットアップコントロール */
		var setupCtrl = function(){

			// DOM要素セットアップ
			entity.settings.frames.wrapAll('<div class="slideChan-view"><div class="slideChan-OuterContainer"><div class="slideChan-container">');
			entity.settings.view = self.find('.slideChan-view');
			entity.settings.OuterContainer = self.find('.slideChan-OuterContainer');
			entity.settings.container = self.find('.slideChan-container');
			
			if(entity.settings.naviPrevSelector && entity.settings.naviNextSelector) {
				entity.settings.defaultNaviUse = false;
				entity.settings.naviPrev = self.find(entity.settings.naviPrevSelector);
				entity.settings.naviNext = self.find(entity.settings.naviNextSelector);
			} else {
				entity.settings.navi = entity.settings.view.append('<div class="slideChan-navi">').find('.slideChan-navi');
				entity.settings.naviPrev = entity.settings.navi.append('<div class="slideChan-naviPrev">').find('.slideChan-naviPrev');
				entity.settings.naviNext = entity.settings.navi.append('<div class="slideChan-naviNext">').find('.slideChan-naviNext');
			}
			
			if(entity.settings.naviButtonUse){
				if(entity.settings.naviButtonSelector) {
					entity.settings.defaultNaviButtonUse = false;
					entity.settings.naviButton = $(entity.settings.naviButtonSelector);
				} else {
					entity.settings.naviButtonContainer = self.append('<div class="slideChan-naviButtonContainer">').find('.slideChan-naviButtonContainer');
					entity.settings.naviButton = entity.settings.naviButtonContainer.append('<ul class="slideChan-naviButton">').find('.slideChan-naviButton');
					for(var i=0;i<entity.settings.framesLen; i++){
						entity.settings.naviButton.append('<li>'+ i +'</li>');
					}
					entity.settings.naviButtonContainer.addClass(entity.settings.naviButtonPosition);
				}
			}
			
			// 初期化
			entity.settings.frames.css('float','left');
			if(!entity.settings.contentsSlideShowMode){
				entity.settings.frames.css('text-align','center');
				entity.settings.frames.find('img').css('width','100%');				
			}
			frameAdjustCtrl();
			slideButtonCtrl(0);
			
			// イベントセットアップ
			entity.settings.naviPrev.on('click', function() {
				slideCtrl(getDispSlideId()-1);
	        });

			entity.settings.naviNext.on('click', function() {
				slideCtrl(getDispSlideId()+1);
	        });

			if(entity.settings.naviButtonUse){
			entity.settings.naviButton.find('li').on('click', function(){
				var index = parseInt($(this).text());
				slideCtrl(index);
			});
			}

			var timer = false;
			$(window).on('resize', function() {
		    	self.setupCompleteFlg = false;
				entity.settings.loading.fadeIn('fast');
			    if (timer !== false) {
			        clearTimeout(timer);
			    }
			    timer = setTimeout(function() {
					self.loadTimerID = setInterval(loadingCtrl, 500);
				    resizeCtrl();
			    }, 200);
			});

			
			// セットアップ完了
			self.setupCompleteFlg = true;
		}		
		
		
		
		

		/* function ::: ローディングコントロール */
		var loadingCtrl = function() {
			if(self.preloadCompleteFlg && self.setupCompleteFlg) {
				clearTimeout(self.loadTimerID);
				entity.settings.loading.delay(300).fadeOut('slow');
			}			
		}

		/* function ::: プリロードコントロール */
		preLoadCtrl.progress = 0;
		function preLoadCtrl() {
			if(entity.loadImgLen > 0) {
					$('img', self).each(function(){
						// 画像のプリロード
						var image = new Image();
						image.onload = function(){
							preLoadCtrl.progress++;
							// 画像読み込み完了判定
							if(preLoadCtrl.progress == entity.loadImgLen){
								self.preloadCompleteFlg = true;
							}
						};
						image.src = $(this).attr('src');
					});
			} else {
				self.preloadCompleteFlg = true;
			}
		}
		
		/* function ::: フレーム調整コントロール */
		var frameAdjustCtrl = function(){
			entity.settings.frameW = entity.settings.OuterContainer.width();
			entity.settings.frames.width(entity.settings.frameW);
			entity.settings.container.width(entity.settings.frameW * entity.settings.framesLen);
			if(entity.settings.defaultNaviUse) {
				entity.settings.navi.width(entity.settings.frameW);
			}

//			entity.settings.frameH = entity.settings.frames.find(':first').height();
//			entity.settings.container.height(entity.settings.frameH);
//			entity.settings.navi.height(entity.settings.frameH);
			if(entity.settings.naviButtonUse && entity.settings.defaultNaviButtonUse){
				var naviButtonW = 0;
				entity.settings.naviButton.find('li').each(function(){
					naviButtonW += $(this).outerWidth(true);
				});
				entity.settings.naviButton.width(naviButtonW);
			}
		}

		/* function ::: スライドショーコントロール */
		var slideCtrl = function(index){
			index = validSlideIndex(index);
			var dist = entity.settings.frameW * index;
			slideButtonCtrl(index);
			entity.settings.container.animate({'marginLeft': -dist + 'px'},entity.settings.slideSpeed);
		};
		
		/* function ::: スライドショーボタンコントロール */
		var slideButtonCtrl = function(index){
			// NEXT・PREVボタン表示設定
			if(index <= 0) {
				entity.settings.naviPrev.fadeOut();
				entity.settings.naviNext.fadeIn();
			} else if(index == entity.settings.framesLen-1) {
				entity.settings.naviPrev.fadeIn();
				entity.settings.naviNext.fadeOut();
			} else {
				entity.settings.naviPrev.fadeIn();
				entity.settings.naviNext.fadeIn();
			}

			// アクティブナビボタン設定
			if(entity.settings.naviButtonUse){
				var navBtnActive = entity.settings.naviButton.find('li:nth-child('+ (index+1) +')');
				navBtnActive.siblings().removeClass('button-active');
				navBtnActive.addClass('button-active');
			}
		};

		/* function ::: リサイズコントロール */
		var resizeCtrl = function() {
			frameAdjustCtrl();
			slideCtrl(0);
			self.setupCompleteFlg = true;
		}

		/* function ::: 表示中のスライドindexを取得 */
		var getDispSlideId = function() {
			var dist = entity.settings.container.css('marginLeft').replace('px', '');
			return Math.abs(Math.floor(dist / entity.settings.frameW));
		};

		/* function ::: スライドindexのValidation */
		var validSlideIndex = function(index) {
			if(!index || index < 0) index = 0; // 正数チェック
			return (index < entity.settings.framesLen) ? index : 0;
		};
		
		initCtrl();
		
		return this;
	};
	
	
})(jQuery);
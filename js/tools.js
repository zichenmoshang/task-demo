(function(window, undefined) {
	/* dom ready
	 * @return {Promise}
	 * **/
	var domLoaded = () => {
		return new Promise((resovle, reject) => {
			if(document.addEventListener) {
				document.addEventListener('DOMContentLoaded', function domLoad() {
					//destory event
					document.removeEventListener('DOMContentLoaded', domLoad, false);
					resovle();
				})
			} else if(document.attachEvent) {
				document.attachEvent('onreadystatechange', function domLoad() {
					//destory event
					if(document.readyState == 'complete') {
						document.detachEvent('onreadystatechange', domLoad);
						resovle();
					}
				});
			}
		})
	};

	/* get json data
	 * @param {String} url
	 * @return {Promise}
	 * **/
	var getJson = (url) => {
		return new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = () => {
				if(xhr.readyState === 4) {
					if(xhr.status === 200) {
						resolve(JSON.parse(xhr.responseText));
					}
				}
			}
			xhr.open('GET', url);
			xhr.send();
		})
	};

	/*
	 * add html template and repeat from data
	 * @param {String} strategy
	 * 
	 * */
	class AddHtmlTemplate {
		constructor(strategy, data) {
			this[strategy](data);
		}
		tab(data) {
			let dom = document.getElementById('tabs');
			let tpl = [];
			for(let i = 0,len = data.length;i < len;i++) {
				tpl.push(`<li class="tab-item ${i === 0 ? 'active' : ''}" data-index="${data[i].id}">${data[i].name}</li>`);
			}
			tpl = tpl.join("");
			dom.style.width = data.length * 70 + 'px';
			dom.style.transform = `translate3d(${document.body.clientWidth / 2 - 70 / 3 + 'px'},0,0)`;
			dom.innerHTML = tpl;
		}
		list(data) {
			let dom = document.getElementById('list');
			let tpl = [];
			for(let group of data) {
				tpl.push('<li class="list-group"><ul>');
				for(let item of group) {
					tpl.push(`<li class="list-item">
								<img src="${item.imgSrc}" width="40" height="40" />
								<article class="list-content">
							  		<h3>${item.title}</h3>
							  		<p class="list-description">${item.content}</p>
							  		<div class="list-foot">
										<span>${item.price}</span>	
										<div class="buttons">
											<a data-num="${item.id}" data-group="${item.groupId}" data-op="minus" class="minusOp">
												<i data-num="${item.id}" data-group="${item.groupId}" data-op="minus" class="fa fa-minus"></i>
											</a>
											<input type="number" class="list-input" value="0" data-num="${item.id}" data-group="${item.groupId}">	
											<a data-num="${item.id}" data-group="${item.groupId}" data-op="plus" class="plusOp">
												<i data-num="${item.id}" data-group="${item.groupId}" data-op="plus" class="fa fa-plus"></i>
											</a>
										</div>
									</div>
								</article>
							</li>`);
				}
				tpl.push('</ul></li>');
			}
			tpl = tpl.join("");
			dom.innerHTML = tpl;
		}
	}
	
	/*
	 * throttle,60 frames per second
	 * @param {function} callback
	 * @param {date} lastTime
	 * @return {object} 
	 * id => timeoutId   
	 * lastTime => next lastTime
	 * */
	function throttle(callback,lastTime) {
		let currTime = new Date().getTime();
		let timeToCall = Math.max(0, 16 - (currTime - lastTime));
		let id = setTimeout(function() {
			callback();
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return {
			id: id,
			lastTime: lastTime
		};
	};
	
	/*
	 *  class Scroll
	 *  @param {documentId} id
	 *  @param {function} fn 
 	 * */
	class Scroll{
		constructor(id,fn) {
			this.dom = document.getElementById(id);
			this.fn = fn;
			this.opsition = {
				startX: undefined,
				startY: undefined,
				endX: undefined,
				endY: undefined,
				left: undefined,
				top: undefined
			};
			this.ticking = false;
			this.raf = {
				id: undefined,
				lastTime: 0
			};
		    this.register();
		    
		}
		register(type){
			this.dom.addEventListener('touchstart',(e) => {
				this.opsition.startX = e.touches[0].pageX;
				this.opsition.startY = e.touches[0].pageY;
				let matchArr = this.dom.style.transform.match(/(-?\d+\.?\d*)(?=px)/g);
				this.opsition.left = Number(matchArr[0]);
				this.opsition.top = Number(matchArr[1]);
			})
			this.dom.addEventListener('touchmove',(e) => {
				if(!this.ticking) {
					this.opsition.endX = e.touches[0].pageX;
					this.opsition.endY = e.touches[0].pageY;
					let deltaX = this.opsition.left + this.opsition.endX - this.opsition.startX;
					let deltaY = this.opsition.top + this.opsition.endY - this.opsition.startY;
					this.raf = throttle(() => {
						this.ticking = false;
						if(typeof this.fn === 'function'){
							this.fn({
								deltaX: deltaX,
								deltaY: deltaY
							});
						}
					},this.raf.lastTime);
				};
				this.ticking = true;
			})
			this.dom.addEventListener('touchend',(e) => {
				this.ticking = false;
				clearTimeout(this.raf.id);
			})
		}
	}
	
	
	var Tools = {
		domLoaded: domLoaded,
		getJson: getJson,
		AddHtmlTemplate: AddHtmlTemplate,
		Scroll: Scroll
	};

	window.Tools = Tools;
})(window);
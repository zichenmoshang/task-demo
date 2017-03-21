(function(window, undefined) {
	//cache tabs 
	function tabsCacheFn() {
		let dom = document.getElementById('tabs'),
			children = Array.prototype.slice.call(dom.children),
			middleWidth = document.body.clientWidth / 2,
			itemWidth = 70,
			maxWidth = middleWidth - itemWidth / 3,
			minWidth = -Number((dom.style.width).replace('px', '')) + middleWidth;
		return {
			dom: dom,
			children: children,
			middleWidth: middleWidth,
			itemWidth: itemWidth,
			maxWidth: maxWidth,
			minWidth: minWidth
		}
	};

	//cache list
	function listCacheFn(data) {
		let dom = document.getElementById('list'),
			listHeight = 120,
			maxHeight = 0,
			lenArray = [0];
		for(let group of data) {
			lenArray.push(lenArray[lenArray.length - 1] + group.length);
		}
		return {
			dom: dom,
			listHeight: listHeight,
			lenArray: lenArray,
			maxHeight: maxHeight,
			minHeight: -(lenArray[lenArray.length - 1] - 1) * listHeight
		}
	};

	//cache cart data and element
	function cartCacheFn() {
		let listInput = document.querySelectorAll('.list-input'),
			cartDom = document.getElementById('footer'),
			goodsNum = document.getElementById('goodsNum'),
			goodsPrice = document.getElementById('goodsPrice');
		return {
			listInput: listInput,
			cartDom: cartDom,
			goodsNum: goodsNum,
			goodsPrice: goodsPrice,
			oldValue: 0
		}
	};

	/*
	 * input num operation
	 * @param {number | string} i
	 * @param {string} price
	 * @param {string} op  'minus|plus'
	 * @param {object} cache
	 * **/
	function numOp(i, price, op, cache) {
		let num,
			goodsnum = Number(cache.goodsNum.innerText),
			goodsprice = Number(cache.goodsPrice.innerText);
		switch(op) {
			case 'minus':
				num = +cache.listInput[i].value;
				if(num > 0) {
					--goodsnum;
					--num;
					goodsprice -= Number(price.replace(/\$/g, ''));
				}
				cache.listInput[i].value = num;
				break;
			case 'plus':
				num = +cache.listInput[i].value;
				if(num < 100) {
					++goodsnum;
					++num;
					goodsprice += Number(price.replace(/\$/g, ''));
				}
				cache.listInput[i].value = num;
				break;
		}
		if(num === 0) {
			cache.cartDom.style.display = 'none';
		} else {
			cache.goodsNum.innerText = goodsnum;
			cache.goodsPrice.innerText = goodsprice;
			cache.cartDom.style.display = 'flex';
		}
	};

	/*
	 * input value change
	 * @param {number | string} i
	 * @param {string} price
	 * @param {object} cache 
	 * @param {string} value 
	 * **/
	function inputChange(i, price, cache, value) {
		let delta,
			goodsnum;
		if(value === '') {
			delta = 0;
			goodsnum = Number(cache.goodsNum.innerText) - cache.oldValue;
		} else {
			delta = Number(value) - cache.oldValue;
			goodsnum = Number(cache.goodsNum.innerText) + delta;
		};
		let goodsprice = Number(cache.goodsPrice.innerText) + delta * Number(price.replace(/\$/g, ''));
		if(goodsnum === 0) {
			cache.cartDom.style.display = 'none';
		} else {
			cache.goodsNum.innerText = goodsnum;
			cache.goodsPrice.innerText = goodsprice;
			cache.cartDom.style.display = 'flex';
		};
	};

	//page init event
	async function asyncInit() {
		await Tools.domLoaded();
		var result = await Tools.getJson('js/mockData.json');
		return result;
	};

	asyncInit().then(function(data) {
		//load template
		new Tools.AddHtmlTemplate('tab', data.tabItems);
		new Tools.AddHtmlTemplate('list', data.lists);
		//get cache
		let tabsCache = tabsCacheFn();
		let listCache = listCacheFn(data.lists);
		let cartCache = cartCacheFn();
		//current index
		let lastIndex = 0;
		//bind scroll event
		new Tools.Scroll('tabs', (pos) => {
			if(pos.deltaX <= tabsCache.maxWidth && pos.deltaX >= tabsCache.minWidth) {
				tabsCache.dom.style.webkitTransform = tabsCache.dom.style.transform = 'translate3d(' + pos.deltaX + 'px,0px,0px)translateZ(0)';
				let i = Math.abs(parseInt((pos.deltaX - tabsCache.middleWidth) / tabsCache.itemWidth));
				if(lastIndex !== i) {
					tabsCache.children.forEach(function(item, index) {
						if(index === i) {
							item.classList.add('active');
						} else {
							item.classList.remove('active');
						}
					});

					if(listCache.lenArray[i] !== undefined) {
						listCache.dom.style.webkitTransform = listCache.dom.style.transform = 'translate3d(0px,' + (-listCache.lenArray[i] * listCache.listHeight) + 'px,0px)translateZ(0)';
					}
					lastIndex = i;
				}
			}
		});
		new Tools.Scroll('list', (pos) => {
			if(pos.deltaY <= listCache.maxHeight && pos.deltaY >= listCache.minHeight) {
				listCache.dom.style.webkitTransform = listCache.dom.style.transform = 'translate3d(0px,' + pos.deltaY + 'px,0px)translateZ(0)';
				let i = Math.abs(parseInt(pos.deltaY / listCache.listHeight));
				let tmpArr = listCache.lenArray.slice();
				tmpArr.push(i);
				i = tmpArr.sort(function(a, b) {
					return a - b;
				}).indexOf(i);
				if(lastIndex !== i) {
					tabsCache.children.forEach(function(item, index) {
						if(index === i) {
							item.classList.add('active');
						} else {
							item.classList.remove('active');
						}
					});
					tabsCache.dom.style.webkitTransform = tabsCache.dom.style.transform = 'translate3d(' + (-tabsCache.itemWidth * i + tabsCache.middleWidth - 70 / 3) + 'px,0px,0px)translateZ(0)';
					lastIndex = i;
				}
			}
		});
		//delegate event
		listCache.dom.addEventListener('click', (e) => {
			let dom = e.target;
			switch(dom.tagName) {
				case 'I':
				case 'A':
					let group = dom.dataset.group;
					let num = dom.dataset.num - listCache.lenArray[group]; 
					numOp(dom.dataset.num, data.lists[group][num].price, dom.dataset.op, cartCache);
					break;
				default:
					break;
			}
		});
		//delegate event
		listCache.dom.addEventListener('keydown', (e) => {
			if(e.target.tagName === 'INPUT') {
				//remember old value
				cartCache.oldValue = e.target.value;
			}
		});
		//delegate event
		listCache.dom.addEventListener('keyup', (e) => {
			let dom = e.target;
			if(dom.tagName === 'INPUT') {
				if(dom.value < 0) {
					dom.value = 0;
					cartCache.oldValue = 0;
				} else {
					let group = dom.dataset.group;
					let num = dom.dataset.num - listCache.lenArray[group]; 
					inputChange(dom.dataset.num, data.lists[group][num].price, cartCache, dom.value);
				}

			}
		});
	});

})(window);
addModule('keyboardNav', (module, moduleID) => {
	module.moduleName = 'Keyboard Navigation';
	module.category = ['Browsing'];
	module.description = 'Keyboard navigation for reddit!';
	module.options = {
		mediaBrowseMode: {
			type: 'boolean',
			value: true,
			description: 'If media is open on the currently selected post when moving up/down one post, open media on the next post.'
		},
		scrollOnExpando: {
			type: 'boolean',
			value: true,
			description: 'Scroll window to top of link when expando key is used (to keep pics etc in view)',
			advanced: true
		},
		scrollStyle: {
			type: 'enum',
			values: [{
				name: 'directional',
				value: 'directional'
			}, {
				name: 'page up/down',
				value: 'page'
			}, {
				name: 'lock to top',
				value: 'top'
			}, {
				name: 'legacy',
				value: 'legacy'
			}],
			value: 'directional',
			description: `
				When moving up/down with keynav, when and how should RES scroll the window?
				<br>Directional: Scroll just enough to bring the selected element into view, if it's offscreen.
				<br>Page up/down: Scroll up/down an entire page after reaching the top or bottom.
				<br>Lock to top: Always align the selected element to the top of the screen.
				<br>Legacy: If the element is offscreen, lock to top.
			`,
			advanced: true
		},
		commentsLinkNumbers: {
			type: 'boolean',
			value: true,
			description: 'Assign number keys (e.g. [1]) to links within selected comment'
		},
		commentsLinkNumberPosition: {
			type: 'enum',
			values: [{
				name: 'Place on right',
				value: 'right'
			}, {
				name: 'Place on left',
				value: 'left'
			}],
			value: 'right',
			description: 'Which side commentsLinkNumbers are displayed',
			advanced: true
		},
		commentsLinkNewTab: {
			type: 'boolean',
			value: true,
			description: 'Open number key links in a new tab',
			advanced: true
		},
		onHideMoveDown: {
			type: 'boolean',
			value: true,
			description: 'After hiding a link, automatically select the next link',
			advanced: true
		},
		onVoteMoveDown: {
			type: 'boolean',
			value: false,
			description: 'After voting on a link, automatically select the next link',
			advanced: true
		},
		onVoteCommentMoveDown: {
			type: 'boolean',
			value: false,
			description: 'After voting on a comment, automatically select the next comment',
			advanced: true
		},
		useGoMode: {
			type: 'boolean',
			value: true,
			description: 'Use go mode (require go mode before "go to" shortcuts are used, e.g. frontpage)'
		},
		followLinkNewTabFocus: {
			type: 'boolean',
			value: true,
			description: 'When following a link in new tab - focus the tab?',
			advanced: true
		}
	};

	const commands = {
		toggleHelp: {
			value: [191, false, false, true], // ? (note the true in the shift slot)
			description: 'Show help for keyboard shortcuts'
		},
		goMode: {
			value: [71, false, false, false], // g
			description: 'Enter "go mode" (next keypress goes to a location, e.g. frontpage)'
		},
		toggleCmdLine: {
			value: [190, false, false, false], // .
			description: 'Launch RES command line',
			callback() { modules['commandLine'].toggleCmdLine(); }
		},
		hide: {
			include: ['linklist', 'profile'],
			value: [72, false, false, false], // h
			description: 'Hide link'
		},
		moveUp: {
			include: ['linklist', 'profile', 'search'],
			value: [75, false, false, false], // k
			description: 'Move up to the previous link or comment in flat lists'
		},
		moveDown: {
			include: ['linklist', 'profile', 'search'],
			value: [74, false, false, false], // j
			description: 'Move down to the next link or comment in flat lists'
		},
		moveUpComment: {
			include: ['comments', 'inbox'],
			value: [75, false, false, false], // k
			description: 'Move up to the previous comment on threaded comment pages'
		},
		moveDownComment: {
			include: ['comments', 'inbox'],
			value: [74, false, false, false], // j
			description: 'Move down to the next comment on threaded comment pages'
		},
		moveTop: {
			include: ['linklist', 'profile', 'inbox', 'search'],
			value: [75, false, false, true], // shift-k
			description: 'Move to top of list (on link pages)'
		},
		moveBottom: {
			include: ['linklist', 'profile', 'inbox', 'search'],
			value: [74, false, false, true], // shift-j
			description: 'Move to bottom of list (on link pages)'
		},
		moveUpSibling: {
			include: ['comments'],
			value: [75, false, false, true], // shift-k
			description: 'Move to previous sibling (in comments) - skips to previous sibling at the same depth.'
		},
		moveDownSibling: {
			include: ['comments'],
			value: [74, false, false, true], // shift-j
			description: 'Move to next sibling (in comments) - skips to next sibling at the same depth.'
		},
		moveUpThread: {
			include: ['comments'],
			value: [75, true, false, true], // shift-alt-k
			description: 'Move to the topmost comment of the previous thread (in comments).'
		},
		moveDownThread: {
			include: ['comments'],
			value: [74, true, false, true], // shift-alt-j
			description: 'Move to the topmost comment of the next thread (in comments).'
		},
		moveToTopComment: {
			include: ['comments'],
			value: [84, false, false, false], // t
			description: 'Move to the topmost comment of the current thread (in comments).'
		},
		moveToParent: {
			include: ['comments'],
			value: [80, false, false, false], // p
			description: 'Move to parent (in comments).'
		},
		showParents: {
			include: ['comments'],
			value: [80, false, false, true], // p
			description: 'Display parent comments.'
		},
		followLink: {
			include: ['linklist', 'profile', 'comments', 'search'],
			value: [13, false, false, false], // enter
			description: 'Follow link (link pages only)'
		},
		followLinkNewTab: {
			include: ['linklist', 'profile', 'comments', 'search'],
			value: [13, false, false, true], // shift-enter
			description: 'Follow link in new tab (link pages only)',
			callback() {
				module.followLink(true);
			}
		},
		toggleExpando: {
			value: [88, false, false, false], // x
			description: 'Toggle expando (image/text/video) (link pages only)',
			callback() {
				if (RESUtils.isPageType('comments')) {
					toggleAllExpandos();
				} else {
					module.toggleExpando();
				}
			}
		},
		imageSizeUp: {
			value: [187, false, false, false], // = -- 61 in firefox
			description: 'Increase the size of image(s) in the highlighted post area'
		},
		imageSizeDown: {
			value: [189, false, false, false], // - -- 173 in firefox
			description: 'Decrease the size of image(s) in the highlighted post area'
		},
		imageSizeUpFine: {
			value: [187, false, false, true], // shift-=
			description: 'Increase the size of image(s) in the highlighted post area (finer control)',
			callback() { module.imageSizeUp(true); }
		},
		imageSizeDownFine: {
			value: [189, false, false, true], // shift--
			description: 'Decrease the size of image(s) in the highlighted post area (finer control)',
			callback() { module.imageSizeDown(true); }
		},
		imageMoveUp: {
			value: [38, false, true, false], // ctrl-up
			description: 'Move the image(s) in the highlighted post area up'
		},
		imageMoveDown: {
			value: [40, false, true, false], // ctrl-down
			description: 'Move the image(s) in the highlighted post area down'
		},
		imageMoveLeft: {
			value: [37, false, true, false], // ctrl-left
			description: 'Move the image(s) in the highlighted post area left'
		},
		imageMoveRight: {
			value: [39, false, true, false], // ctrl-right
			description: 'Move the image(s) in the highlighted post area right'
		},
		previousGalleryImage: {
			value: [219, false, false, false], // [
			description: 'View the previous image of an inline gallery.'
		},
		nextGalleryImage: {
			value: [221, false, false, false], // ]
			description: 'View the next image of an inline gallery.'
		},
		toggleViewImages: {
			value: [88, false, false, true], // shift-x
			description: 'Toggle "view images" button'
		},
		toggleChildren: {
			include: ['comments', 'inbox'/* mostly modmail */],
			value: [13, false, false, false], // enter
			description: 'Expand/collapse comments (comments pages only)'
		},
		followComments: {
			include: ['linklist', 'profile', 'search'],
			value: [67, false, false, false], // c
			description: 'View comments for link (shift opens them in a new tab)'
		},
		followCommentsNewTab: {
			include: ['linklist', 'profile', 'search'],
			value: [67, false, false, true], // shift-c
			description: 'View comments for link in a new tab',
			callback() { module.followComments(true); }
		},
		followLinkAndCommentsNewTab: {
			include: ['linklist', 'profile'],
			value: [76, false, false, false], // l
			description: 'View link and comments in new tabs',
			callback() { followLinkAndComments(); }
		},
		followLinkAndCommentsNewTabBG: {
			include: ['linklist', 'profile'],
			value: [76, false, false, true], // shift-l
			description: 'View link and comments in new background tabs',
			callback() { followLinkAndComments(true); }
		},
		upVote: {
			include: ['linklist', 'profile', 'comments', 'inbox', 'search'],
			value: [65, false, false, false], // a
			description: 'Upvote selected link or comment (or remove the upvote)'
		},
		downVote: {
			include: ['linklist', 'profile', 'comments', 'inbox', 'search'],
			value: [90, false, false, false], // z
			description: 'Downvote selected link or comment (or remove the downvote)'
		},
		upVoteWithoutToggling: {
			include: ['linklist', 'profile', 'comments', 'inbox', 'search'],
			value: [65, false, false, true], // a
			description: 'Upvote selected link or comment (but don\'t remove the upvote)',
			callback() { module.upVote(true); }
		},
		downVoteWithoutToggling: {
			include: ['linklist', 'profile', 'comments', 'inbox', 'search'],
			value: [90, false, false, true], // z
			description: 'Downvote selected link or comment (but don\'t remove the downvote)',
			callback() { module.downVote(true); }
		},
		savePost: {
			include: ['linklist', 'profile', 'comments'],
			value: [83, false, false, false], // s
			description: 'Save the current post to your reddit account. This is accessible from anywhere that you\'re logged in, but does not preserve the original text if it\'s edited or deleted.',
			callback() { module.saveLink(); }
		},
		saveComment: {
			include: ['comments'],
			value: [83, false, false, true], // shift-s
			description: 'Save the current comment to your reddit account. This is accessible from anywhere that you\'re logged in, but does not preserve the original text if it\'s edited or deleted.'
		},
		saveRES: {
			include: ['comments', 'profile'],
			value: [83, false, false, false], // s
			description: 'Save the current comment with RES. This does preserve the original text of the comment, but is only saved locally.',
			callback() { module.saveCommentRES(); }
		},
		reply: {
			include: ['comments', 'inbox'],
			value: [82, false, false, false], // r
			description: 'Reply to current comment (comment pages only)'
		},
		followPermalink: {
			include: ['comments', 'inbox'],
			value: [89, false, false, false], // y
			description: 'Open the current comment\'s permalink (comment pages only)'
		},
		followPermalinkNewTab: {
			include: ['comments', 'inbox'],
			value: [89, false, false, true], // shift-y
			description: 'Open the current comment\'s permalink in a new tab (comment pages only)',
			callback() { module.followPermalink(true); }
		},
		followSubreddit: {
			include: ['linklist', 'profile', 'search'],
			value: [82, false, false, false], // r
			description: 'Go to subreddit of selected link (link pages only)'
		},
		followSubredditNewTab: {
			include: ['linklist', 'profile', 'search'],
			value: [82, false, false, true], // shift-r
			description: 'Go to subreddit of selected link in a new tab (link pages only)',
			callback() { module.followSubreddit(true); }
		},
		inbox: {
			value: [73, false, false, false], // i
			description: 'Go to inbox',
			dependsOn: 'goMode'
		},
		inboxNewTab: {
			value: [73, false, false, true], // shift+i
			description: 'Go to inbox in a new tab',
			dependsOn: 'goMode',
			callback() { module.inbox(true); }
		},
		modmail: {
			value: [77, false, false, false], // m
			description: 'Go to modmail',
			dependsOn: 'goMode'
		},
		modmailNewTab: {
			value: [77, false, false, true], // shift+m
			description: 'Go to modmail in a new tab',
			dependsOn: 'goMode',
			callback() { module.modmail(true); }
		},
		profile: {
			value: [85, false, false, false], // u
			description: 'Go to profile',
			dependsOn: 'goMode'
		},
		profileNewTab: {
			value: [85, false, false, true], // shift+u
			description: 'Go to profile in a new tab',
			dependsOn: 'goMode',
			callback() { module.profile(true); }
		},
		frontPage: {
			value: [70, false, false, false], // f
			description: 'Go to front page',
			dependsOn: 'goMode'
		},
		subredditFrontPage: {
			value: [70, false, false, true], // shift-f
			description: 'Go to subreddit front page',
			dependsOn: 'goMode',
			callback() { module.frontPage(true); }
		},
		random: {
			value: [89, true, false, false], // alt-y   SO RANDOM
			description: 'Go to a random subreddit',
			dependsOn: 'goMode'
		},
		nextPage: {
			include: ['linklist', 'profile', 'inbox'],
			value: [78, false, false, false], // n
			description: 'Go to next page (link list pages only)',
			dependsOn: 'goMode'
		},
		prevPage: {
			include: ['linklist', 'profile', 'inbox'],
			value: [80, false, false, false], // p
			description: 'Go to prev page (link list pages only)',
			dependsOn: 'goMode'
		},
		link1: {
			value: [49, false, false, false], // 1
			description: 'Open first link within comment.',
			noconfig: true,
			callback() { commentLink(0); }
		},
		link2: {
			value: [50, false, false, false], // 2
			description: 'Open link #2 within comment.',
			noconfig: true,
			callback() { commentLink(1); }
		},
		link3: {
			value: [51, false, false, false], // 3
			description: 'Open link #3 within comment.',
			noconfig: true,
			callback() { commentLink(2); }
		},
		link4: {
			value: [52, false, false, false], // 4
			description: 'Open link #4 within comment.',
			noconfig: true,
			callback() { commentLink(3); }
		},
		link5: {
			value: [53, false, false, false], // 5
			description: 'Open link #5 within comment.',
			noconfig: true,
			callback() { commentLink(4); }
		},
		link6: {
			value: [54, false, false, false], // 6
			description: 'Open link #6 within comment.',
			noconfig: true,
			callback() { commentLink(5); }
		},
		link7: {
			value: [55, false, false, false], // 7
			description: 'Open link #7 within comment.',
			noconfig: true,
			callback() { commentLink(6); }
		},
		link8: {
			value: [56, false, false, false], // 8
			description: 'Open link #8 within comment.',
			noconfig: true,
			callback() { commentLink(7); }
		},
		link9: {
			value: [57, false, false, false], // 9
			description: 'Open link #9 within comment.',
			noconfig: true,
			callback() { commentLink(8); }
		},
		link10: {
			value: [48, false, false, false], // 0
			description: 'Open link #10 within comment.',
			noconfig: true,
			callback() { commentLink(9); }
		},
		link1NumPad: {
			value: [97, false, false, false], // 1
			description: 'Open first link within comment.',
			noconfig: true,
			callback() { commentLink(0); }
		},
		link2NumPad: {
			value: [98, false, false, false], // 2
			description: 'Open link #2 within comment.',
			noconfig: true,
			callback() { commentLink(1); }
		},
		link3NumPad: {
			value: [99, false, false, false], // 3
			description: 'Open link #3 within comment.',
			noconfig: true,
			callback() { commentLink(2); }
		},
		link4NumPad: {
			value: [100, false, false, false], // 4
			description: 'Open link #4 within comment.',
			noconfig: true,
			callback() { commentLink(3); }
		},
		link5NumPad: {
			value: [101, false, false, false], // 5
			description: 'Open link #5 within comment.',
			noconfig: true,
			callback() { commentLink(4); }
		},
		link6NumPad: {
			value: [102, false, false, false], // 6
			description: 'Open link #6 within comment.',
			noconfig: true,
			callback() { commentLink(5); }
		},
		link7NumPad: {
			value: [103, false, false, false], // 7
			description: 'Open link #7 within comment.',
			noconfig: true,
			callback() { commentLink(6); }
		},
		link8NumPad: {
			value: [104, false, false, false], // 8
			description: 'Open link #8 within comment.',
			noconfig: true,
			callback() { commentLink(7); }
		},
		link9NumPad: {
			value: [105, false, false, false], // 9
			description: 'Open link #9 within comment.',
			noconfig: true,
			callback() { commentLink(8); }
		},
		link10NumPad: {
			value: [96, false, false, false], // 0
			description: 'Open link #10 within comment.',
			noconfig: true,
			callback() { commentLink(9); }
		},
		toggleCommentNavigator: {
			include: 'comments',
			value: [78, false, false, false], // N
			description: 'Open Comment Navigator'
		},
		commentNavigatorMoveUp: {
			include: 'comments',
			value: [38, false, false, true], // shift+up arrow
			description: 'Move up using Comment Navigator'
		},
		commentNavigatorMoveDown: {
			include: 'comments',
			value: [40, false, false, true], // shift+down arrow
			description: 'Move down using Comment Navigator'
		}
	};
	module.loadDynamicOptions = function() {
		$.each(commands, registerCommand);
	};
	module.beforeLoad = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			registerCommandLine();
			registerSelectedThingWatcher();
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			window.addEventListener('keydown', e => {
				if (handleKeyPress(e)) {
					e.preventDefault();
				}
			}, true);
		}
	};

	function registerCommandLine() {
		modules['commandLine'].registerCommand(/\d+/, '[number] - navigates to the link with that number (comments pages) or rank (link pages)',
			() => {},
			command => {
				if (RESUtils.isPageType('comments')) {
					// comment link number? (integer)
					commentLink(parseInt(command, 10) - 1);
				} else if (RESUtils.isPageType('linklist')) {
					const targetRank = parseInt(command, 10);
					followLinkByRank(targetRank);
				}
			}
		);
	}

	function registerSelectedThingWatcher() {
		modules['selectedEntry'].addListener(updateAnnotations);
	}

	function registerCommand(commandName, spec) {
		if (!spec.callback) {
			if (module[commandName]) {
				spec.callback = ::module[commandName];
			} else {
				console.error('No callback for keyboardNav command', commandName);
				spec.callback = function() {
					console.warn('No callback for keyboardNav command', commandName);
				};
			}
		}

		module.options[commandName] = $.extend(true,
			{ type: 'keycode' },
			module.options[commandName],
			spec
		);
	}

	function promptLogin() {
		if (!RESUtils.loggedInUser()) {
			const loginButton = document.querySelector('#header .login-required');
			if (loginButton) {
				RESUtils.click(loginButton);
			}

			return true;
		}
	}

	const recentKeyTimer = RESUtils.debounce(() => (module.recentKeyPress = false), 1000);

	function recentKey() {
		module.recentKeyPress = true;
		recentKeyTimer();
	}

	function updateAnnotations(selected, last) {
		if (selected && RESUtils.isPageType('comments') && module.options.commentsLinkNumbers.value) {
			const links = getCommentLinks(selected.entry);
			let annotationCount = 0;
			for (const link of links) {
				const annotation = document.createElement('span');
				annotationCount++;
				annotation.classList.add('noCtrlF');
				annotation.setAttribute('data-text', `[${annotationCount}] `);
				if (annotationCount <= 9) {
					annotation.title = `press ${annotationCount} to open link`;
				} else if (annotationCount === 10) {
					annotation.title = 'press 0 to open link';
				} else {
					annotation.title = `press ${module.getNiceKeyCode('toggleCmdLine')} then ${annotationCount} and Enter to open link`;
				}
				annotation.classList.add('keyNavAnnotation');
				if (module.options.commentsLinkNumberPosition.value === 'right') {
					RESUtils.insertAfter(link, annotation);
				} else {
					link.parentNode.insertBefore(annotation, link);
				}
			}
		}

		if (last && RESUtils.isPageType('comments')) {
			const annotations = last.entry.querySelectorAll('div.md .keyNavAnnotation');
			$(annotations).remove();
		}
	}

	function handleKeyLink(link) {
		if (link.classList.contains('toggleImage')) {
			RESUtils.click(link);
			return false;
		}

		const url = link.getAttribute('href');

		if (module.options.commentsLinkNewTab.value) {
			RESEnvironment.openNewTab(url, module.options.followLinkNewTabFocus.value);
		} else {
			location.href = url;
		}
	}

	let keyHelp;

	const drawHelp = RESUtils.once(() => {
		keyHelp = RESUtils.createElement('div', 'keyHelp');
		const helpTable = document.createElement('table');
		keyHelp.appendChild(helpTable);
		const helpTableHeader = document.createElement('thead');
		const helpTableHeaderRow = document.createElement('tr');
		const helpTableHeaderKey = document.createElement('th');
		$(helpTableHeaderKey).text('Key');
		helpTableHeaderRow.appendChild(helpTableHeaderKey);
		const helpTableHeaderFunction = document.createElement('th');
		$(helpTableHeaderFunction).text('Function');
		helpTableHeaderRow.appendChild(helpTableHeaderFunction);
		helpTableHeader.appendChild(helpTableHeaderRow);
		helpTable.appendChild(helpTableHeader);
		const helpTableBody = document.createElement('tbody');
		const isLink = /^link[\d]+$/i;
		for (const i in module.options) {
			if ((module.options[i].type === 'keycode') && (!isLink.test(i))) {
				const thisRow = document.createElement('tr');
				const thisRowKey = document.createElement('td');
				let thisKeyCode = module.getNiceKeyCode(i);
				if (module.options[i].dependsOn && module.options[module.options[i].dependsOn].type === 'keycode') {
					thisKeyCode = [module.getNiceKeyCode(module.options[i].dependsOn), thisKeyCode].join(', ');
				}
				$(thisRowKey).text(thisKeyCode);
				thisRow.appendChild(thisRowKey);
				const thisRowDesc = document.createElement('td');
				$(thisRowDesc).text(module.options[i].description);
				thisRow.appendChild(thisRowDesc);
				helpTableBody.appendChild(thisRow);
			}
		}
		helpTable.appendChild(helpTableBody);
		document.body.appendChild(keyHelp);
	});

	module.getNiceKeyCode = function(optionKey) {
		let keyCodeArray = module.options[optionKey].value;
		if (!keyCodeArray) {
			return '';
		}

		if (typeof keyCodeArray === 'string') {
			keyCodeArray = parseInt(keyCodeArray, 10);
		}
		if (typeof keyCodeArray === 'number') {
			keyCodeArray = [keyCodeArray, false, false, false, false];
		}
		return RESUtils.niceKeyCode(keyCodeArray);
	};

	const _commandLookup = RESUtils.once(() => {
		const lookup = {};
		$.each(module.options, (name, option) => {
			if (option.type !== 'keycode') return;
			if (!option.callback) return;
			if (!RESUtils.matchesPageLocation(option.include, option.exclude)) return;

			const hash = RESUtils.hashKeyArray(option.value);
			if (!lookup[hash]) {
				lookup[hash] = $.Callbacks();
			}
			lookup[hash].add(option.callback);
		});
		return lookup;
	});

	function getCommandsForKeyEvent(keyEvent) {
		const hash = RESUtils.hashKeyEvent(keyEvent);
		return _commandLookup()[hash];
	}

	function handleKeyPress(e) {
		const konamitest = !modules['easterEgg'].konamiActive();
		if ((document.activeElement.tagName === 'BODY') && (konamitest)) {
			const callbacks = getCommandsForKeyEvent(e);
			if (callbacks) {
				callbacks.fire(e);
				return true;
			}
		}
	}

	module.toggleHelp = function() {
		if (keyHelp && keyHelp.style.display === 'block') {
			hideHelp();
		} else {
			showHelp();
		}
	};

	function showHelp() {
		// show help!
		drawHelp();
		RESUtils.fadeElementIn(keyHelp, 0.3);
	}

	function hideHelp() {
		// hide help!
		RESUtils.fadeElementOut(keyHelp, 0.3);
	}

	module.hide = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		// find the hide link and click it...
		const hideLink = selected.entry.querySelector('form.hide-button > span > a');
		RESUtils.click(hideLink);
		// if ((module.options.onHideMoveDown.value) && (!modules['betteReddit'].options.fixHideLink.value)) {
		if (module.options.onHideMoveDown.value) {
			module.moveDown();
		}
	};

	module.followSubreddit = function(newWindow) {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;

		// find the subreddit link and click it...
		const srLink = selected.getSubredditLink();
		if (srLink) {
			const url = srLink.getAttribute('href');
			if (newWindow) {
				RESEnvironment.openNewTab(url, module.options.followLinkNewTabFocus.value);
			} else {
				location.href = url;
			}
		}
	};

	module.moveUp = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		_moveUp(selected.thing);
	};

	module.moveUpComment = function() {
		module.moveUp();
	};

	function _moveUp(fromThing) {
		const current = fromThing;
		const things = modules['selectedEntry'].selectableThings();
		const index = things.index(current);

		let target;
		let targetIndex = Math.max(1, index);
		do {
			targetIndex--;
			target = things[targetIndex];
		} while (target && $(target).is('.collapsed .thing'));

		if (module.mediaBrowseMode(target, fromThing)) {
			_moveToThing(target, { scrollStyle: 'top' });
		} else {
			_moveToThing(target, {
				scrollStyle: module.options.scrollStyle.value
			});
		}

		recentKey();
	}

	module.moveDown = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		_moveDown(selected.thing);
	};

	module.moveDownComment = function() {
		module.moveDown();
	};

	function _moveDown(fromThing) {
		const current = fromThing;
		const things = modules['selectedEntry'].selectableThings();
		const index = things.index(current);

		let target;
		let targetIndex = Math.min(index, things.length - 2);
		do {
			targetIndex++;
			target = things[targetIndex];
		} while (target && $(target).is('.collapsed .thing'));

		if (module.mediaBrowseMode(target, fromThing)) {
			_moveToThing(target, { scrollStyle: 'top' });
		} else {
			_moveToThing(target, {
				scrollStyle: module.options.scrollStyle.value
			});
		}

		// note: we don't want to go to the next page if we're on the dashboard...
		if (
			(!RESUtils.currentSubreddit('dashboard')) &&
			RESUtils.isPageType('linklist') &&
			things.index(target) + 2 > things.length && // moving down near the bottom of the list
			modules['neverEndingReddit'].isEnabled() &&
			modules['neverEndingReddit'].options.autoLoad.value
		) {
			module.nextPage(true);
		}
		recentKey();
	}

	module.moveTop = function() {
		const things = modules['selectedEntry'].selectableThings();
		const target = things.first();
		modules['selectedEntry'].select(target);
		recentKey();
	};

	module.moveBottom = function() {
		const things = modules['selectedEntry'].selectableThings();
		const target = things.last();
		modules['selectedEntry'].select(target, { scrollStyle: 'top' });
		recentKey();
	};

	function _moveToThing(target, options) {
		const collapsed = $(target).parents('.collapsed.thing');
		if (collapsed.length) {
			target = collapsed.last()[0];
		}

		modules['selectedEntry'].select(target, options);
		recentKey();
	}

	module.moveDownSibling = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		let $current = $(selected.thing);
		let target;

		if ($current.hasClass('link')) {
			target = document.querySelector('.thing.comment');
		}

		while (!target && $current.length) {
			target = $current.nextAll('.thing').first()[0];
			if (!target) {
				$current = $current.parent().closest('.thing');
			}
		}

		_moveToThing(target, { scrollStyle: 'legacy' });
	};

	module.moveUpSibling = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const $current = $(selected.thing);

		let target = $current.prevAll('.thing').first()[0];
		if (!target) {
			target = $current.parent().closest('.thing')[0];
		}

		if (!target) {
			target = document.querySelector('.thing.link');
		}

		_moveToThing(target, { scrollStyle: 'legacy' });
	};

	module.moveUpThread = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		let current = $(selected.thing).parents('.thing').last();
		if (!current.length) {
			current = $(selected.thing).closest('.thing');
		}

		const target = current.prevAll('.thing').first()[0];
		if (!target) {
			_moveUp(current);
		} else {
			_moveToThing(target, { scrollStyle: 'legacy' });
		}
	};

	module.moveDownThread = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		let current = $(selected.thing).parents('.thing').last();
		if (!current.length) {
			current = $(selected.thing).closest('.thing');
		}

		const target = current.nextAll('.thing').first()[0];
		if (target) {
			_moveToThing(target, { scrollStyle: 'legacy' });
		}
	};

	module.moveToTopComment = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;
		const target = $(selected.thing).parents('.thing').last();

		_moveToThing(target, { scrollStyle: 'legacy' });
	};

	module.moveToParent = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const target = $(selected.thing).parent().closest('.thing');
		_moveToThing(target);
	};

	module.showParents = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const button = selected.entry.querySelector('.buttons .bylink[href^="#"]');
		if (button) {
			modules['hover'].infocard('showParent')
				.target(button)
				.populateWith(modules['showParent'].showCommentHover)
				.begin();
		}
	};

	module.toggleChildren = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		if (selected.thing.classList.contains('link')) return;

		// find out if this is a collapsed or uncollapsed view...
		let thisToggle = selected.entry.querySelector('a.expand');

		// check if this is a "show more comments" box, or just contracted content...
		const moreComments = selected.entry.querySelector('span.morecomments > a');
		if (moreComments) {
			thisToggle = moreComments;
		}

		// 'continue this thread' links
		const contThread = selected.entry.querySelector('span.deepthread > a');
		if (contThread) {
			thisToggle = contThread;
		}

		RESUtils.click(thisToggle);
	};

	module.toggleExpando = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const thisExpando = selected.getExpandoButton();
		if (thisExpando) {
			const expanding = !thisExpando.classList.contains('expanded');
			RESUtils.click(thisExpando);
			if (module.options.scrollOnExpando.value && expanding) {
				RESUtils.scrollToElement(selected.thing, { scrollStyle: 'top' });
			}
		}
	};

	let mediaBrowseModeExpanded = false;

	module.mediaBrowseMode = function(newThing, oldThing) {
		if (!oldThing || !newThing) return false;
		if (RESUtils.isPageType('linklist', 'search') && module.options.mediaBrowseMode.value && !modules['showImages'].haltMediaBrowseMode) {
			const oldExpando = oldThing && new RESUtils.thing(oldThing).entry.querySelector('.expando-button');
			const newExpando = newThing && new RESUtils.thing(newThing).entry.querySelector('.expando-button');
			if (oldExpando) {
				mediaBrowseModeExpanded = oldExpando.classList.contains('expanded');
				if (mediaBrowseModeExpanded) {
					RESUtils.click(oldExpando);
				}
			}
			if (newExpando && mediaBrowseModeExpanded && !newExpando.classList.contains('expanded')) {
				RESUtils.click(newExpando);

				return true;
			}
		}
	};

	function imageResize(factor) {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const images = $(selected.entry).find('.RESImage, .madeVisible video');

		for (const image of Array.from(images)) {
			const thisWidth = $(image).width();
			modules['showImages'].resizeMedia(image, thisWidth + factor);
		}
	}

	module.imageSizeUp = function(fineControl) {
		fineControl = typeof fineControl === 'boolean' ? fineControl : undefined;
		const factor = (fineControl) ? 50 : 150;
		imageResize(factor);
	};

	module.imageSizeDown = function(fineControl) {
		fineControl = typeof fineControl === 'boolean' ? fineControl : undefined;
		const factor = (fineControl) ? -50 : -150;
		imageResize(factor);
	};

	module.imageMoveUp = function() {
		imageMove(0, -50);
	};

	module.imageMoveDown = function() {
		imageMove(0, 50);
	};

	module.imageMoveLeft = function() {
		imageMove(-50, 0);
	};

	module.imageMoveRight = function() {
		imageMove(50, 0);
	};

	function imageMove(deltaX, deltaY) {
		const images = $(document).find('.RESImage');
		if (images.length === 0) {
			return false;
		}
		let mostVisible = -1;
		let mostVisiblePercentage = 0;
		Array.from(images).forEach((image, i) => {
			const percentageVisible = RESUtils.getPercentageVisibleYAxis(images[i]);
			if (percentageVisible > mostVisiblePercentage) {
				mostVisible = i;
				mostVisiblePercentage = percentageVisible;
			}
		});
		// Don't move any images if none are visible
		if (mostVisible === -1) {
			return false;
		}
		modules['showImages'].moveMedia(images[mostVisible], deltaX, deltaY);
	}

	module.previousGalleryImage = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const previousButton = selected.entry.querySelector('.RESGalleryControls .previous');
		if (previousButton) {
			RESUtils.click(previousButton);
		}
	};

	module.nextGalleryImage = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const nextButton = selected.entry.querySelector('.RESGalleryControls .next');
		if (nextButton) {
			RESUtils.click(nextButton);
		}
	};

	module.toggleViewImages = function() {
		modules['showImages'].setShowImages();
	};

	function toggleAllExpandos() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const thisExpandos = selected.getExpandoButtons();
		if (thisExpandos) {
			for (const expando of Array.from(thisExpandos)) {
				RESUtils.click(expando);
			}
		}
	}

	module.followLink = function(newWindow) {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		if (RESUtils.isPageType('comments') && !selected.thing.classList.contains('link')) return;

		newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;

		const thisHREF = selected.getPostLink().href;
		if (newWindow) {
			RESEnvironment.openNewTab(thisHREF, module.options.followLinkNewTabFocus.value);
		} else {
			location.href = thisHREF;
		}
	};

	function followLinkByRank(num) {
		const target = modules['selectedEntry'].selectableThings().filter(function() {
			const rankEle = this.querySelector('.rank');
			const rank = rankEle && parseInt(rankEle.textContent, 10);
			return rank === num;
		});
		modules['selectedEntry'].select(target);
		module.followLink();
	}

	module.followPermalink = function(newWindow) {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;
		newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;

		const thisA = selected.entry.querySelector('a.bylink');
		if (!thisA) return;
		const url = thisA.getAttribute('href');
		if (newWindow) {
			RESEnvironment.openNewTab(url, module.options.followLinkNewTabFocus.value);
		} else {
			location.href = url;
		}
	};

	module.followComments = function(newWindow) {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;
		const url = selected.getCommentsLink().getAttribute('href');
		if (newWindow) {
			RESEnvironment.openNewTab(url, module.options.followLinkNewTabFocus.value);
		} else {
			location.href = url;
		}
	};

	function followLinkAndComments(background) {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;
		background = typeof background === 'boolean' ? background : undefined;

		// find the [l+c] link and click it...
		const lcLink = selected.entry.querySelector('.redditSingleClick');
		RESUtils.mousedown(lcLink, background && 1);
	}

	module.upVote = function(preventToggle) {
		if (promptLogin()) return;
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;
		preventToggle = typeof preventToggle === 'boolean' ? preventToggle : undefined;

		const upVoteButton = selected.getUpvoteButton();

		if (!upVoteButton) {
			return;
		}

		if (modules['noParticipation'].isVotingBlocked()) {
			modules['noParticipation'].notifyNoVote();
		} else if (!preventToggle || !upVoteButton.classList.contains('upmod')) {
			RESUtils.click(upVoteButton);
		}

		const link = RESUtils.isPageType('linklist', 'profile');
		if (link && module.options.onVoteMoveDown.value || !link && module.options.onVoteCommentMoveDown.value) {
			module.moveDown();
		}
	};

	module.downVote = function(preventToggle) {
		if (promptLogin()) return;
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;
		preventToggle = typeof preventToggle === 'boolean' ? preventToggle : undefined;

		const downVoteButton = selected.getDownvoteButton();

		if (!downVoteButton) {
			return;
		}

		if (modules['noParticipation'].isVotingBlocked()) {
			modules['noParticipation'].notifyNoVote();
		} else if (!preventToggle || !downVoteButton.classList.contains('downmod')) {
			RESUtils.click(downVoteButton);
		}

		const link = RESUtils.isPageType('linklist', 'profile');
		if (link && module.options.onVoteMoveDown.value || !link && module.options.onVoteCommentMoveDown.value) {
			module.moveDown();
		}
	};

	module.saveLink = function() {
		if (promptLogin()) return;
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const saveLink = selected.entry.querySelector('.link-save-button a') || selected.entry.querySelector('.link-unsave-button a');
		if (saveLink) {
			RESUtils.click(saveLink);
		}
	};

	module.saveComment = function() {
		if (promptLogin()) return;
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const saveComment = selected.entry.querySelector('.comment-save-button > a');
		if (saveComment) {
			RESUtils.click(saveComment);
		}
	};

	module.saveCommentRES = function() {
		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		const saveComment = selected.entry.querySelector('.saveComments, .unsaveComments');
		if (saveComment) {
			RESUtils.click(saveComment);
			modules['saveComments'].showEducationalNotification();
		}
	};

	module.reply = function() {
		if (promptLogin()) return;

		const selected = modules['selectedEntry'].selected();
		if (!selected) return;

		if (selected.thing.classList.contains('link') && RESUtils.isPageType('comments')) {
			// Reply to OP, but only if a reply form is available
			const $target = $('.usertext-edit textarea[name=text]:first');
			if ($target.filter(':visible').length) {
				$target.focus();
				return;
			}
		}

		// User can reply directly here, so open/focus the reply form
		const replyButton = selected.entry.querySelector('.buttons a[onclick*=reply]');
		if (replyButton) {
			RESUtils.click(replyButton);
			return;
		}

		// User cannot reply directly from this page, so go to where they can reply
		const replyAt = selected.entry.querySelector('.buttons a.comments, .buttons a.bylink');
		if (replyAt) {
			RESUtils.click(replyAt);
		}
	};

	function navigateTo(newWindow, thisHREF) {
		if (newWindow) {
			RESEnvironment.openNewTab(thisHREF);
		} else {
			location.href = thisHREF;
		}
	}

	const goModePanel = RESUtils.once(() => {
		const $panel = $('<div id="goModePanel" class="RESDialogSmall">')
			.append('<h3>Press a key to go:</h3><div id="goModeCloseButton" class="RESCloseButton">&times;</div>');

		// add the keyboard shortcuts...
		const $contents = $('<div class="RESDialogContents"></div>');
		const $shortCutList = $('<table>');
		for (const key in module.options) {
			if (module.options[key].dependsOn === 'goMode') {
				const niceKeyCode = module.getNiceKeyCode(key);
				$shortCutList.append(`<tr><td>${niceKeyCode}</td><td class="arrow">&rarr;</td><td>${key}</td></tr>`);
			}
		}
		$contents.append($shortCutList);
		$panel.append($contents);
		$panel.on('click', '.RESCloseButton', module.goMode);
		return $panel;
	});

	let goModeActive;

	module.goMode = function() {
		if (!module.options.useGoMode.value) {
			return;
		}
		goModeActive = !goModeActive;
		if (goModeActive) {
			$('body').on('keyup', handleGoModeEscapeKey);
			$(document.body).append(goModePanel().fadeIn());
		} else {
			hideGoModePanel();
		}
	};

	function hideGoModePanel() {
		goModeActive = false;
		goModePanel().fadeOut();
		$('body').off('keyup', handleGoModeEscapeKey);
	}

	function handleGoModeEscapeKey(event) {
		if (event.which === 27) {
			hideGoModePanel();
		}
	}

	module.inbox = function(newWindow) {
		if ((module.options.useGoMode.value) && (!goModeActive)) {
			return;
		}
		newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;
		hideGoModePanel();
		navigateTo(newWindow, '/message/inbox/');
	};

	module.modmail = function(newWindow) {
		if ((module.options.useGoMode.value) && (!goModeActive)) {
			return;
		}
		newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;
		hideGoModePanel();
		navigateTo(newWindow, '/message/moderator/');
	};

	module.profile = function(newWindow) {
		if ((module.options.useGoMode.value) && (!goModeActive)) {
			return;
		}
		newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;
		hideGoModePanel();
		navigateTo(newWindow, `/user/${RESUtils.loggedInUser()}`);
	};

	module.frontPage = function(subreddit) {
		if ((module.options.useGoMode.value) && (!goModeActive)) {
			return;
		}
		subreddit = typeof subreddit === 'boolean' ? subreddit : undefined;
		hideGoModePanel();

		if (subreddit && !RESUtils.currentSubreddit()) {
			return;
		}

		let url = '/';
		if (subreddit) {
			url += `r/${RESUtils.currentSubreddit()}`;
		}
		location.href = url;
	};

	module.nextPage = function(override) {
		override = typeof override === 'boolean' ? override : undefined;
		if (override !== true && module.options.useGoMode.value && !goModeActive) {
			return;
		}
		hideGoModePanel();
		// if Never Ending Reddit is enabled, just scroll to the bottom.  Otherwise, click the 'next' link.
		if ((modules['neverEndingReddit'].isEnabled()) && (modules['neverEndingReddit'].progressIndicator)) {
			RESUtils.click(modules['neverEndingReddit'].progressIndicator);
			module.moveBottom();
		} else {
			// get the first link to the next page of reddit...
			const nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks();
			const link = nextPrevLinks.next;
			if (link) {
				// RESUtils.click(nextLink);
				location.href = link.getAttribute('href');
			}
		}
	};

	module.prevPage = function() {
		if ((module.options.useGoMode.value) && (!goModeActive)) {
			return false;
		}
		hideGoModePanel();
		// if Never Ending Reddit is enabled, do nothing.  Otherwise, click the 'prev' link.
		if (modules['neverEndingReddit'].isEnabled()) {
			return false;
		} else {
			const nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks();
			const link = nextPrevLinks.prev;
			if (link) {
				// RESUtils.click(prevLink);
				location.href = link.getAttribute('href');
			}
		}
	};

	function getCommentLinks(entry) {
		if (!entry) {
			const selected = modules['selectedEntry'].selected();
			if (!selected) return [];

			entry = selected && selected.entry;
		}

		return Array.from(entry.querySelectorAll('div.md a:not(.expando-button):not(.madeVisible):not(.toggleImage):not(.noKeyNav):not([href^="javascript:"]):not([href="#"])'))
			.filter(link => !RESUtils.isCommentCode(link) && !RESUtils.isEmptyLink(link));
	}

	function commentLink(num) {
		if (module.options.commentsLinkNumbers.value) {
			const links = getCommentLinks();
			if (typeof links[num] !== 'undefined') {
				let thisLink = links[num];
				if ((thisLink.nextSibling) && (typeof thisLink.nextSibling.tagName !== 'undefined') && (thisLink.nextSibling.classList.contains('expando-button'))) {
					thisLink = thisLink.nextSibling;
				}
				handleKeyLink(thisLink);
			}
		}
	}

	module.toggleCommentNavigator = function() {
		const cNav = modules['commentNavigator'];
		if (cNav.isEnabled()) {
			if (cNav.isOpen) {
				cNav.hideNavigator();
			} else {
				cNav.showNavigator();
			}
		}
	};

	module.commentNavigatorMoveUp = function() {
		modules['commentNavigator'].moveUp();
	};

	module.commentNavigatorMoveDown = function() {
		modules['commentNavigator'].moveDown();
	};

	module.random = function() {
		if ((module.options.useGoMode.value) && (!goModeActive)) {
			return;
		}
		hideGoModePanel();

		location.href = '/r/random';
	};
});

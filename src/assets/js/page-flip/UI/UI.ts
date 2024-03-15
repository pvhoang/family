import { PageFlip } from '../PageFlip';
import { Point } from '../BasicTypes';
import { FlipSetting, SizeType } from '../Settings';
import { FlipCorner, FlippingState } from '../Flip/Flip';
import { Orientation } from '../Render/Render';

const UI_DEBUG = true;

type SwipeData = {
    point: Point;
    time: number;
};

/**
 * UI Class, represents work with DOM
 */
export abstract class UI {
    protected readonly parentElement: HTMLElement;

    protected readonly app: PageFlip;
    protected readonly wrapper: HTMLElement;
    protected distElement: HTMLElement;

    private touchPoint: SwipeData = null;
    private readonly swipeTimeout = 250;
    private readonly swipeDistance: number;

    private onResize = (): void => {
        this.update();
    };

    /**
     * @constructor
     *
     * @param {HTMLElement} inBlock - Root HTML Element
     * @param {PageFlip} app - PageFlip instanse
     * @param {FlipSetting} setting - Configuration object
     */
    protected constructor(inBlock: HTMLElement, app: PageFlip, setting: FlipSetting) {
        this.parentElement = inBlock;

        inBlock.classList.add('stf__parent');
        // Add first wrapper
        inBlock.insertAdjacentHTML('afterbegin', '<div class="stf__wrapper"></div>');

        this.wrapper = inBlock.querySelector('.stf__wrapper');

        this.app = app;

        const k = this.app.getSettings().usePortrait ? 1 : 2;

        // Setting block sizes based on configuration
        inBlock.style.minWidth = setting.minWidth * k + 'px';
        inBlock.style.minHeight = setting.minHeight + 'px';

        if (setting.size === SizeType.FIXED) {
            inBlock.style.minWidth = setting.width * k + 'px';
            inBlock.style.minHeight = setting.height + 'px';
        }

        if (setting.autoSize) {
            inBlock.style.width = '100%';
            inBlock.style.maxWidth = setting.maxWidth * 2 + 'px';
        }

        inBlock.style.display = 'block';

        window.addEventListener('resize', this.onResize, false);
        this.swipeDistance = setting.swipeDistance;
    }

    /**
     * Destructor. Remove all HTML elements and all event handlers
     */
    public destroy(): void {
        if (this.app.getSettings().useMouseEvents) this.removeHandlers();

        this.distElement.remove();
        this.wrapper.remove();
    }

    /**
     * Updating child components when resizing
     */
    public abstract update(): void;

    /**
     * Get parent element for book
     *
     * @returns {HTMLElement}
     */
    public getDistElement(): HTMLElement {
        return this.distElement;
    }

    /**
     * Get wrapper element
     *
     * @returns {HTMLElement}
     */
    public getWrapper(): HTMLElement {
        return this.wrapper;
    }

    /**
     * Updates styles and sizes based on book orientation
     *
     * @param {Orientation} orientation - New book orientation
     */
    public setOrientationStyle(orientation: Orientation): void {
        this.wrapper.classList.remove('--portrait', '--landscape');

        if (orientation === Orientation.PORTRAIT) {
            if (this.app.getSettings().autoSize)
                this.wrapper.style.paddingBottom =
                    (this.app.getSettings().height / this.app.getSettings().width) * 100 + '%';

            this.wrapper.classList.add('--portrait');
        } else {
            if (this.app.getSettings().autoSize)
                this.wrapper.style.paddingBottom =
                    (this.app.getSettings().height / (this.app.getSettings().width * 2)) * 100 +
                    '%';

            this.wrapper.classList.add('--landscape');
        }

        this.update();
    }

    protected removeHandlers(): void {
        window.removeEventListener('resize', this.onResize);

        this.distElement.removeEventListener('mousedown', this.onMouseDown);
        this.distElement.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('touchend', this.onTouchEnd);
    }

    protected setHandlers(): void {
        window.addEventListener('resize', this.onResize, false);
        if (!this.app.getSettings().useMouseEvents) return;

        this.distElement.addEventListener('mousedown', this.onMouseDown);
        this.distElement.addEventListener('touchstart', this.onTouchStart);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('touchmove', this.onTouchMove, {
            passive: !this.app.getSettings().mobileScrollSupport,
        });
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('touchend', this.onTouchEnd);
    }

    /**
     * Convert global coordinates to relative book coordinates
     *
     * @param x
     * @param y
     */
    private getMousePos(x: number, y: number): Point {
			const rect = this.distElement.getBoundingClientRect();
			return {
					x: x - rect.left,
					y: y - rect.top,
			};
    }

    private checkTarget(targer: EventTarget): boolean {
			if (!this.app.getSettings().clickEventForward)
				return true;
			if (['a', 'button'].includes((targer as HTMLElement).tagName.toLowerCase())) {
					return false;
			}
			return true;
    }

    private onMouseDown = (e: any): void => {
			if (UI_DEBUG)
				console.log('onMouseDown - e: ', e);
			if (this.checkTarget(e.target)) {
					const pos = this.getMousePos(e.clientX, e.clientY);
					this.app.startUserTouch(pos);
					e.preventDefault();
			}
    };

    private onTouchStart = (e: TouchEvent): void => {

			if (UI_DEBUG)
				console.log('onTouchStart - changedTouches: ', e.changedTouches.length);

			if (this.checkTarget(e.target)) {
				if (e.changedTouches.length > 0) {
					const t = e.changedTouches[0];
					const pos = this.getMousePos(t.clientX, t.clientY);

					this.touchPoint = {
							point: pos,
							time: Date.now(),
					};

					// part of swipe detection
					setTimeout(() => {
							if (this.touchPoint !== null) {
									this.app.startUserTouch(pos);
							}
					}, this.swipeTimeout);

					if (!this.app.getSettings().mobileScrollSupport) e.preventDefault();
				}
			}
    };

    private onMouseUp = (e: any): void => {
			if (UI_DEBUG)
				console.log('onMouseUp - e: ', e, e.clientX, e.clientY);
			let isSwipe = false;
			const pos = this.getMousePos(e.clientX, e.clientY);
			
			let element = e.srcElement;
			if (element) {

				if (UI_DEBUG)
					console.log('onMouseUp - element, class: ', element, element.getAttribute("class"));
			
				// this is for alertConfirm in JPG and PDF in tree.page.ts
				let c = element.getAttribute("class");
				if (c && (c.indexOf("alert-button-inner") >= 0)) {
					// alert-button-inner sc-ion-alert-md
					isSwipe = true;
					if (UI_DEBUG)
						console.log('onMouseUp - isSwipe: ', isSwipe);
					return;
				}
				// ignore flip if element has special ID, this is for buttons 'pha_he' and 'pha_do' in home.page.html
				let id = element.getAttribute("id");
				if (UI_DEBUG)
					console.log('onMouseUp - id: ', id);
				if (id && 
					(	id == 'view-pha-he' || 
						id == 'view-pha-do' || 
						id == 'document-download' ||
						id.indexOf('image-id-') == 0
					))
					
					// ignore flipping
					isSwipe = true;

			} else {
				let mousePosition = this.app.getMousePosition();
				const dx = pos.x - mousePosition.x;
				const distY = Math.abs(pos.y - mousePosition.y);
				if (UI_DEBUG)
					console.log('onMouseUp - dx, distY: ', dx, distY);
				if (distY > Math.abs(dx))
					// this is vertical swipe, Y > X, ignore flip
					isSwipe = true;
			}
			this.app.userStop(pos, isSwipe);
    };

    private onMouseMove = (e: any): void => {
        const pos = this.getMousePos(e.clientX, e.clientY);
        this.app.userMove(pos, false);
    };

    private onTouchMove = (e: TouchEvent): void => {
        if (e.changedTouches.length > 0) {
            const t = e.changedTouches[0];
            const pos = this.getMousePos(t.clientX, t.clientY);

            if (this.app.getSettings().mobileScrollSupport) {
                if (this.touchPoint !== null) {
                    if (
                        Math.abs(this.touchPoint.point.x - pos.x) > 10 ||
                        this.app.getState() !== FlippingState.READ
                    ) {
                        if (e.cancelable) this.app.userMove(pos, true);
                    }
                }

                if (this.app.getState() !== FlippingState.READ) {
                    e.preventDefault();
                }
            } else {
                this.app.userMove(pos, true);
            }
        }
    };

    private onTouchEnd = (e: any): void => {

			if (UI_DEBUG)
				console.log('onTouchEnd - e: ', e);
			if (e.changedTouches.length > 0) {
				const t = e.changedTouches[0];
				const pos = this.getMousePos(t.clientX, t.clientY);
				let isSwipe = false;
				// swipe detection
				if (this.touchPoint !== null) {
					const dx = pos.x - this.touchPoint.point.x;
					const distY = Math.abs(pos.y - this.touchPoint.point.y);
					if (UI_DEBUG)
						console.log('onTouchEnd - dx, distY: ', dx, distY);
					if (distY > Math.abs(dx)) {
						// this is vertical swipe, ignore flip
						isSwipe = true;
					}
					this.touchPoint = null;
				}
				this.app.userStop(pos, isSwipe);
			}
    };
}

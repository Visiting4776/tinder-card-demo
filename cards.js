function log_transform(x, max_y){
    return Math.log( Math.min(1, x/(max_y*1.5)) * (Math.E-1) + 1 ) * max_y
}

const MAX_ROTATE_ANG = 25;
const MAX_X_OFFSET = MAX_Y_OFFSET = 250;
const SWIPE_THRESHOLD = 175;
let cards = document.querySelectorAll('.tinder-card');
let mouseIsClicked, dragStartX, dragStartY;

function onMouseDown(card, e){
    card.style.transition = ''; // temporarily remove transition effects
    card.style.cursor = 'grabbing';
    mouseIsClicked = true;

    if(e.touches){ //user is on mobile!
        dragStartX = e.touches[0].pageX;
        dragStartY = e.touches[0].pageY;
    } else {
        dragStartX = e.clientX;
        dragStartY = e.clientY;
    }

    /** determine the rotation angle at the
     * time of the first click already, to avoid 
     * flickering during the later drag movement: */
    card.rotationMultiplier = -(e.offsetY - card.offsetHeight/2) / Math.abs(e.offsetY - card.offsetHeight/2);
}

function onMouseMove(card, e){
    if(! mouseIsClicked)
    { return; }

    e.preventDefault(); // e.g. no text selection

    let xDrag, xDragAbsolute, offsetX, offsetY;

    if(e.touches){ // user on mobile
        offsetY = Math.max(
            Math.min((e.touches[0].pageY - dragStartY), MAX_Y_OFFSET),
            -MAX_Y_OFFSET
        );
        
        xDrag = e.touches[0].pageX - dragStartX;
    } else {
        offsetY = Math.max(
            Math.min((e.clientY - dragStartY), MAX_Y_OFFSET),
            -MAX_Y_OFFSET
        );
        
        xDrag = e.clientX - dragStartX;
    }

    xDragAbsolute = Math.abs(xDrag);
    offsetX = log_transform(xDragAbsolute, MAX_X_OFFSET) * (xDragAbsolute/xDrag);

    if(offsetX > SWIPE_THRESHOLD)
        { card.classList.add('tinder-like'); } 
    else if(offsetX < -SWIPE_THRESHOLD)
        { card.classList.add('tinder-dislike'); } 
    else 
        { card.classList.remove('tinder-like', 'tinder-dislike'); }
    
    let rotationAngle = Math.min(offsetX/12, MAX_ROTATE_ANG) * card.rotationMultiplier;

    let transformString = `translate(${offsetX}px, ${offsetY}px) rotate(${rotationAngle}deg)`;
    card.style.transform = transformString;
    card.style["-webkit-transform"] = transformString;
}

function onMouseUp(){
    mouseIsClicked = false;
    cards.forEach(card => {
        let transitionPrefix = '';
        if ('' !== card.initialTransition)
            { transitionPrefix = ', '; }

        card.style.transition = card.initialTransition + transitionPrefix + "transform .125s";
        card.style.webkitTransition = card.initialWebkitTransition + transitionPrefix + "transform .125s";
        card.style.transform = card.initialTransform;
        card.style["-webkit-transform"] = card.initialWebkitTransform;
        card.style.cursor = card.initialCursor;

        if(card.classList.contains('tinder-like')){
            card.remove();
            // card.classList.remove('tinder-like');
            console.log('Card liked!');
        } else if(card.classList.contains('tinder-dislike')){
            card.remove();
            // card.classList.remove('tinder-dislike');
            console.log('Card disliked!');
        }
    })
}

cards.forEach(card => {
    card.initialTransform = card.style.transform;
    card.initialWebkitTransform = card.style["-webkit-transform"];
    card.initialTransition = card.style.transition;
    card.initialWebkitTransition = card.style.webkitTransition;
    card.initialCursor = card.style.cursor;

    card.addEventListener('touchstart', e => onMouseDown(card, e));
    card.addEventListener('mousedown', e => onMouseDown(card, e));

    card.addEventListener('mousemove', e => onMouseMove(card, e));
    card.addEventListener('touchmove', e => onMouseMove(card, e));
});

document.addEventListener('mouseup', onMouseUp);
document.addEventListener('touchend', onMouseUp);
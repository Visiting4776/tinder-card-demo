function log_transform(x, max_y){
    return Math.log( Math.min(1, x/(max_y*1.5)) * (Math.E-1) + 1 ) * max_y
}

const MAX_ROTATE_ANG = 25;
const MAX_X_OFFSET = MAX_Y_OFFSET = 250;
const SWIPE_THRESHOLD = 200;
let cards = document.querySelectorAll('.tinder-card');
let mouseIsClicked, dragStartX, dragStartY;

cards.forEach(card => {
    card.initialTransform = card.style.transform;
    card.initialTransition = card.style.transition;
    card.initialCursor = card.style.cursor;

    card.addEventListener('mousedown', e => {
        card.style.transition = ''; // temporarily remove transition effects
        card.style.cursor = 'grabbing';
        mouseIsClicked = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        /** determine the rotation angle at the
         * time of the first click already, to avoid 
         * flickering during the later drag movement: */
        card.rotationMultiplier = -(e.offsetY - card.offsetHeight/2) / Math.abs(e.offsetY - card.offsetHeight/2);
    });

    card.addEventListener('mousemove', e => {
        if(! mouseIsClicked)
            { return; }
        
        e.preventDefault(); // e.g. no text selection
        let offsetY = Math.max(
            Math.min((e.clientY - dragStartY), MAX_Y_OFFSET),
            -MAX_Y_OFFSET
        );
        
        let xDragAbsolute = Math.abs(e.clientX - dragStartX);
        let offsetX = log_transform(xDragAbsolute, MAX_X_OFFSET);
        offsetX *= (xDragAbsolute/(e.clientX - dragStartX)); //times -1 if dragged towards the left

        if(offsetX > SWIPE_THRESHOLD)
            { card.classList.add('tinder-like'); } 
        else if(offsetX < -SWIPE_THRESHOLD)
            { card.classList.add('tinder-dislike'); } 
        else 
            { card.classList.remove('tinder-like', 'tinder-dislike'); }

        let rotationAngle = Math.min(offsetX/12, MAX_ROTATE_ANG) * card.rotationMultiplier;
        
        card.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotationAngle}deg)`;
    });
});

document.addEventListener('mouseup', e => {
    mouseIsClicked = false;
    cards.forEach(card => {
        let transitionPrefix = '';
        if ('' !== card.initialTransition)
            { transitionPrefix = ', '; }

        card.style.transition = card.initialTransition + transitionPrefix + "transform .125s"
        card.style.transform = card.initialTransform;
        card.style.cursor = card.initialCursor;

        if(card.classList.contains('tinder-like')){
            //card.remove();
            card.classList.remove('tinder-like');
            console.log('Card liked!');
        } else if(card.classList.contains('tinder-dislike')){
            //card.remove();
            card.classList.remove('tinder-dislike');
            console.log('Card disliked!');
        }
    })
});
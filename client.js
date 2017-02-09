// https://github.com/yanatan16/nanoajax
!function(t,e){function n(t){return t&&e.XDomainRequest&&!/MSIE 1/.test(navigator.userAgent)?new XDomainRequest:e.XMLHttpRequest?new XMLHttpRequest:void 0}function o(t,e,n){t[e]=t[e]||n}var r=["responseType","withCredentials","timeout","onprogress"];t.ajax=function(t,a){function s(t,e){return function(){c||(a(void 0===f.status?t:f.status,0===f.status?"Error":f.response||f.responseText||e,f),c=!0)}}var u=t.headers||{},i=t.body,d=t.method||(i?"POST":"GET"),c=!1,f=n(t.cors);f.open(d,t.url,!0);var l=f.onload=s(200);f.onreadystatechange=function(){4===f.readyState&&l()},f.onerror=s(null,"Error"),f.ontimeout=s(null,"Timeout"),f.onabort=s(null,"Abort"),i&&(o(u,"X-Requested-With","XMLHttpRequest"),e.FormData&&i instanceof e.FormData||o(u,"Content-Type","application/x-www-form-urlencoded"));for(var p,m=0,v=r.length;v>m;m++)p=r[m],void 0!==t[p]&&(f[p]=t[p]);for(var p in u)f.setRequestHeader(p,u[p]);return f.send(i),f},e.nanoajax=t}({},function(){return this}());


const list=[]; //=> is replaced by server

function* linkGenerator(list) {
    let l = [].concat(list);
    while (l.length) {
        yield l.shift();
    }
    return false;
}

var bCatchActions = false;

function startGame(){
    var sourceNode  = document.querySelector('a.link.skeleton');
    var skel        = sourceNode.cloneNode(true);
    skel.classList.remove('skeleton');
    var par         = sourceNode.parentNode;
    par.removeChild(sourceNode);
    document.body.classList.add('game-started');


    var linkList = linkGenerator(list);
    var current = linkList.next();
    while (current.value) {
        var clonedNode = skel.cloneNode(true);
        clonedNode.href = current.value.url;
        par.appendChild(clonedNode);
        current = linkList.next();
    }

    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
            par.querySelector(':first-child').classList.add('show');
        });
    });


    var index = 0;
    var indices_pushed = [];
    var action = function(upDown) {
        if (index>=list.length) {
            return;
        }
        var btnPressed = document.querySelector('.ctrl.up');
        if (upDown=='up') {
            indices_pushed.push(0);
        } else {
            indices_pushed.push(1);
            btnPressed = document.querySelector('.ctrl.down');
        }
        if ('animate' in btnPressed) {
            btnPressed.animate([
                {transform: 'scale(1)'},
                {transform: 'scale(0.6)'},
                {transform: 'scale(1)'}
            ], {duration: 160})
        }
        

        par.querySelector('a.link.show:nth-child('+(index+1)+')').classList.add('hide');
        var next = par.querySelector('a.link:nth-child('+(index+2)+')');
        if (next) {
            next.classList.add('show');
        } else {

            //alert('End Game');
            document.body.classList.add('game-ended');
            list.forEach((item, index)=>{
                if (indices_pushed[index]==1) {
                    console.log(item.label);
                }
            });

            nanoajax.ajax({url: '/', method: 'POST', body: 'indices='+indices_pushed.join('')}, function (code, responseText, request) {
                console.log('DONE POSTING');
            })
        }

        index++;
    };

    
    document.addEventListener('keyup', (event)=>{
        var downKey     = 40;
        var upKey       = 38;

        if (event.keyCode==downKey || event.keyCode==upKey) {
            action(event.keyCode==downKey ? 'down' : 'up');
        }
    });

    document.querySelectorAll('.ctrl').forEach((button)=>{
        button.addEventListener('click', function(){
            if (this.classList.contains('down')) {
                action('down');
            } else {
                action('up');
            }
        });
    });
    
}

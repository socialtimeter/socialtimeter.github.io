if (window.WebSocket && navigator.geolocation) {
    var client = new WebSocket('wss://socialtimeter-pabjn.rhcloud.com:8443/')

    function send(client, text) {
        client.send(text)
        console.log('out: ' + text)
    }
    client.addEventListener('connectFailed', function(e) {
        console.error('failed' + e.toString())
    })
    client.addEventListener('error', function(err) {
        console.error(err)
    })
    client.addEventListener('close', function() {
        console.log('closed')
    })
    client.addEventListener('open', function(message) {
        console.log('in:  ' + JSON.stringify(message))
        send(client, 'id' + Math.floor((Math.random() * 1000000)))
        send(client, '234')
        navigator.geolocation.watchPosition(function(pos) {
            document.body.classList.remove('loading')
            document.body.querySelector('article').appendChild(document.createTextNode(JSON.stringify(pos)))
            if (pos.coords.altitudeAccuracy != 0 && pos.coords.altitudeAccuracy != null) {
                document.body.classList.remove('no-altimeter')
                send(client, pos.coords.altitude)
            } else {
                document.body.classList.add('no-altimeter')
            }
        }, function(err) {
            console.err(err)
        })
    })
    client.addEventListener('message', function(message) {
        var data = JSON.parse(message.data)
        console.log(data)
        var el = document.getElementById(data.id)
        if (!el) {
            el = document.createElement('user')
            el.id = data.id
            el.classList.add(data.self ? 'self' : 'other')
            el.appendChild(document.createElement('arrow'))
            el.appendChild(document.createElement('name'))
            el.appendChild(document.createElement('altitude'))
            document.querySelector('article').appendChild(el)
        }
        el.style.backgroundColor = data.color
        el.querySelector('arrow').style.borderRightColor = data.color
        el.querySelector('altitude').innerText = data.altitude
        el.setAttribute('altitude', data.altitude)
        el.querySelector('name').innerText = data.name
        realign()
    })
    document.body.classList.add('loading')
} else {
    document.body.classList.add('no-socket')
}

function realign() {
    var list = document.body.querySelector('article')
    var elements = document.body.querySelectorAll('user')
    var elArr = []
    for (var i = 0; i < elements.length; i++) {
        console.log(i, elements[i], elements[i].nodeType)
        console.log(elArr)
        if (elements[i].nodeType == 1) {
            elArr.push(elements[i])
        } else {
            console.log(elements[i])
            list.removeChild(elements[i])
        }
    }
    elArr.sort(function(a, b) {
        return b.getAttribute('altitude') - a.getAttribute('altitude')
    })
    for (var i = 0; i < elArr.length; i++) {
        list.appendChild(elArr[i]);
        if (i < elArr.length - 1) {
            var spacer = document.createElement('spacer')
            spacer.style.flexBasis = elArr[i].getAttribute('altitude') -
                         elArr[i + 1].getAttribute('altitude') + 'px'
            list.appendChild(spacer)
        }
    }
}

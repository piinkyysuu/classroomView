function screenSize() {
    var screenwidth = window.innerWidth;
    var screenheight = document.getElementById("body").scrollHeight;
    var divisor = 1;
    if(screenwidth <= 130)
    {
        divisor =  4;
    }
    else if( screenwidth > 130 && screenwidth <= 430)
    {
        divisor =  3;
    }
    else if( screenwidth > 430 && screenwidth <= 770)
    {
        divisor =  2;
    }

    setScreenDimensions("left", divisor);
    setScreenDimensions("right", divisor);

    return [screenwidth, screenheight];
}

function setScreenDimensions(direction, divisor = 1)
{
    var example = document.getElementById(direction);

    let height = example.getAttribute("originalHeight");
    let width = example.getAttribute("originalWidth");
    if(height == undefined)
    {
        height = 900;
    }
    if(width == undefined)
    {
        width = 1020;
    }
    
    example.setAttribute("width", width/divisor);
    example.setAttribute("height", height/divisor);
}

function setDimensions (direction, x, y) {
    var example = document.getElementById(direction);
    var valueX = (x*180) + 360;
    var valueY = (y*70) + 180;
    example.setAttribute("width", valueX);
    example.setAttribute("height", valueY);
    example.setAttribute("viewBox", "0,0," + valueX + "," + valueY);
}

var HttpClient = function() {
    this.get = function(theUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "GET", theUrl, true );            
        anHttpRequest.send( null );
    }
}

var client = new HttpClient();

//getting API and creating tables on svg
client.get('http://195.148.31.192:3000/api/labtable', function(response) {
            var data = JSON.parse(response);
            var fixedNumber = 6;
            var x = 180;
            var y = 70;
            var xright = [];
            var yright = [];
            var xleft = [];
            var yleft = [];
            for (let i = 0; i < data.length; i++) {
                var locationXfixed = data[i]["locationX"];
                var locationYfixed = data[i]["locationY"];
                if(locationXfixed < 6) {
                    var locationX = data[i]["locationX"]*x;
                    var locationY = data[i]["locationY"]*y;
                    var tableName = data[i]["labtable_id"];
                    var insideSVG = "<svg><g transform='translate("+locationX+", "+locationY+")' id='tableID_"+tableName+"'><rect width='360px' height='180px' fill='white' stroke='black' stroke-width='3'></rect></g></svg>"
                    $(insideSVG).appendTo(".left");
                    xleft.push(locationXfixed);
                    yleft.push(locationYfixed);
                }
                else {
                    var locationX = (data[i]["locationX"]-6)*x;
                    var locationY = data[i]["locationY"]*y;
                    var tableName = data[i]["labtable_id"];
                    var insideSVG = "<svg><g transform='translate("+locationX+", "+locationY+")' id='tableID_"+tableName+"'><rect width='360px' height='180px' fill='white' stroke='black' stroke-width='3'></rect></g></svg>"
                    $(insideSVG).appendTo(".right");
                    xright.push(locationXfixed);
                    yright.push(locationYfixed);
                }
            }
            xright = Math.max(...xright) - 6;
            yright = Math.max(...yright);
            xleft = Math.max(...xleft);
            yleft = Math.max(...yleft);
            
            function setDimensions (direction, x, y) {
                var example = document.getElementById(direction);
                var valueX = (x*180) + 360;
                var valueY = (y*70) + 180;
                example.setAttribute("width", valueX);
                example.setAttribute("height", valueY);
                example.setAttribute("viewBox", "0,0," + valueX + "," + valueY);
                example.setAttribute("originalWidth",valueX);
                example.setAttribute("originalHeight",valueY);
            }

            setDimensions("right", xright, yright);
            setDimensions("left", xright, yright);

            screenSize();
        });

//getting API and taking sockets for each table
client.get('http://195.148.31.192:3000/api/socket?_size=99', function(response) {
    var data = JSON.parse(response);
    var data = sortIntoLists(data);
    var colorIndication;
    var transformValueX;

    function sortIntoLists(list) {
        let res = []
        for (let step = 0; step < list.length; step++) 
        {
            current = list[step].labtable_labtable_id;
            if(typeof res[current] === 'undefined') {
                res[current] = [];
            }
            res[current].push(list[step]);
        }
        return res;
    }

    for(var i = 1; i < data.length; i++) {
        var amountOfSockets =   data[i].length;
        var orginalX =   (360 - (46*amountOfSockets))/2;
        for (var x = 0; x < data[i].length; x++) {
            var status = data[i][x]["status"];
            var socketName = data[i][x]["socket_name"]; 
            var socketID = data[i][x]["socket_id"];

            if (status == "error") {
                colorIndication = "red";
            } else if (status == "connected") {
                colorIndication = "green";
            } else {
                colorIndication = "black";
            }

            if (x == 0) {
                transformValueX = orginalX;
            }
            else {
                transformValueX += 46;
            }

            var insideTable =   "<svg id ='socketID_"+ socketID +"' data-table="+ i +"' data-socketname='"+socketName+"' data-status='"+ status +"' onmousemove = 'showTooltip(evt, id)' onmouseout = 'hideTooltip()'><g transform='translate("+transformValueX+",50)'>"+
                                    "<rect width='46' height='61' fill='white' />" +
                                    "<text  transform='translate(2, 2)' fill='#969696' font-size='17' font-family='HelveticaNeue, Helvetica Neue'><tspan x='7' y='19'>"+ socketName +"</tspan></text>" +
                                    "<rect y='27' x='0' width='46' height='36' stroke='#000' stroke-width='1' fill='none' />" +
                                    "<path transform='translate(5.5,32)' d='M8,26V22H4V18H0V0H36V18H32v4H28v4Z' fill='"+ colorIndication +"' />" +
                                    "<rect width='2.5' height='6.544' transform='translate(7,      35)' fill='#fff'/>" +
                                    "<rect width='2.5' height='6.544' transform='translate(11.357, 35)' fill='#fff'/>" +
                                    "<rect width='2.5' height='6.544' transform='translate(15.714, 35)' fill='#fff'/>" +
                                    "<rect width='2.5' height='6.544' transform='translate(20.071, 35)' fill='#fff'/>" +
                                    "<rect width='2.5' height='6.544' transform='translate(24.428, 35)' fill='#fff'/>" +
                                    "<rect width='2.5' height='6.544' transform='translate(28.785, 35)' fill='#fff'/>" +
                                    "<rect width='2.5' height='6.544' transform='translate(33.142, 35)' fill='#fff'/>" +
                                    "<rect width='2.5' height='6.544' transform='translate(37.499, 35)' fill='#fff'/>" +
                                "</g></svg>";
            $(insideTable).appendTo("#tableID_" + i);                    
        }
    }
    
});

//getting API and make custom attributes for each socket
client.get('http://195.148.31.192:3000/api/client?_size=99', function(response) {
    var data = JSON.parse(response);
    window.VLANarr = ["0"];
    for (let i = 0; i < data.length; i++) {
        var clientID = data[i]["client_id"];
        var mac = data[i]["MAC"];
        var IP = data[i]["IP"];
        var VLAN = data[i]["VLAN"];
        var socketID = "socketID_" + data[i]["socket_socket_id"];
        document.getElementById(socketID).classList.add(VLAN);
        document.getElementById(socketID).setAttribute('data-clientid', clientID);
        document.getElementById(socketID).setAttribute('data-mac', mac);
        document.getElementById(socketID).setAttribute('data-ip', IP);
        document.getElementById(socketID).setAttribute('data-vlan', VLAN);
        VLANarr.push(VLAN);
    }
    VLANarr = [...new Set(VLANarr)];
    for (let i = 0; i < VLANarr.length; i++) {
        if (VLANarr[i] == 0) {
            var html = "<a onclick='verifyVLAN(0)'>ALL VLAN</a>";
            $(html).appendTo(".vlan-dropdown");
        }
        else {
            var html = "<a onclick='verifyVLAN("+VLANarr[i]+")'>VLAN "+VLANarr[i]+"</a>";
            $(html).appendTo(".vlan-dropdown");
        } 
    }
});

function showTooltip(evt, sender) {
    var element     = document.getElementById(sender);
    var size = screenSize();
    var screenWidth = size[0];
    var screenHeight = size[1];

    var xTooltipPosition;
    var yTooltipPosition;

    var x = screenWidth - evt.pageX;
    var y = screenHeight - evt.pageY;

    if (x < 320 ) {
        xTooltipPosition = evt.pageX - 270;
    }
    else {
        xTooltipPosition = evt.pageX + 5;
    }

    if (y < 180) {
        yTooltipPosition = evt.pageY - 150;
    }
    else {
        yTooltipPosition = evt.pageY + 10;
    }

    var socketID    = element.getAttribute("data-socketname");
    var status      = element.getAttribute("data-status");
    var IPAddress   = element.getAttribute("data-ip");
    var macAddress  = element.getAttribute("data-mac");
    var VLAN        = element.getAttribute("data-vlan");

    var tooltip = document.getElementById("tooltip");
    var text =  "Socket: " + socketID + "<br>" +
                "Status connection: " + status + "<br>" +
                "IP Address: " + IPAddress + "<br>" +
                "VLAN: " + VLAN + "<br>" +
                "Mac Address: " + macAddress;
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    tooltip.style.transition = "all 0.5s";
    tooltip.style.left = xTooltipPosition + 'px';
    tooltip.style.top = yTooltipPosition + 'px';
}

function hideTooltip() {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.transition = "all 1s";
    tooltip.style.display = "none";
}

function verifyVLAN(params) {
    if (params == 0) {
        document.getElementById("vlanOG").innerHTML = "ALL VLAN";
    }
    else {
        document.getElementById("vlanOG").innerHTML = "VLAN " + params;
    }
    for (let i = 0; i < VLANarr.length; i++) {
        var element = document.getElementsByClassName(VLANarr[i]);
        for (let x = 0; x < element.length; x++) {
            if (VLANarr[i] == params || params == 0) {
                element[x].classList.remove("disabled");
            }
            else {
                element[x].classList.add("disabled");
            }
        } 
    }
}


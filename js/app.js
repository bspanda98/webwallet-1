$(document).ready(function() {
    initEntropyGenerator();
    initGUI();
    setQRScanner();
    initQRCodes();
    timeCycle();
    updateEtherLeakAvailability();  
    loadLanguage();  
    $("body").show();
    confirmTerms();    
});

function initGUI() {
    $("#leakEther").on("click",function() { leakEther(); });
    $("#cmdSetSeed").on("click", function() { setSeed(); });
    $("#halt").on("click", function() { stopMining(); });
    $("#resume").on("click", function() { startMining(); });
    $("input").on("mouseover",function() { if ($(this).val()=="") $(this).select(); });
    $("#cmdNewWallet").on("click", function() { newWallet(); });
    $("#cmdSendETH").on("click", function() { $("#withdrawInfo").hide(); sendEth(); });
    $("#cmdCreateAVL").on("click", function() { $("#createInfo").hide(); createTokens(); });
    $("#cmdSendAVL").on("click", function() { $("#sendInfo").hide(); sendTokens(); });
    $("#logOut button").on("click", function() { self.location=self.location.href; });
    $("#createAVLGasRequired").html(web3.fromWei(createAVLGasRequired_value*gasPrice, "ether"));
    $("#sendAVLGasRequired").html(web3.fromWei(sendAVLGasRequired_value*gasPrice, "ether"));
    $("#sendEtherGasRequired").html(web3.fromWei(txgas*gasPrice, "ether"));
    $("#copyaddr").on("click",function() { copyAddress(); });
    $("#overlay, #qrCodeLarge").on("click",function() { $("#overlay").hide(); $("#qrCodeLarge").hide(); });
    $(".info u").on("click", function() { $(".info").hide(); $(".info2").show(); });
    $("#accounts").on("change", function() {
        switchToAccount($("#accounts option:selected").attr("idx"),$("#accounts option:selected").attr("hdidx"));       
    });
    $("#addaccount").on("click",function() {
        bootbox.prompt({
            title: "Enter account number or private key (32 byte hex):",
            inputType: 'text',
            callback: function (result) {
                if (!result) return;
                addAccountNo=result;
            }
        });
    });
}

function initEntropyGenerator() { for (var x=0;x<40;x++) { $("#ev"+x).attr("class", "color"+(Math.floor(Math.random()*12))); } }

function initQRCodes() {
    $("#qrCode").on("click",function() {
        $("#qrCodeLarge").html("");
        new QRCode(
            document.getElementById("qrCodeLarge"), 
            {
                text: "ethereum:"+$("#addr").html(),
                width: 384, height: 384, colorDark : "#000000", colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            }
        );
        $("#overlay").show();
        $("#qrCodeLarge").show();
    });

    $("#addr, .addr").html(contractAddr);
    $("#addr, .addr").attr("href", API_URL + "/address/"+contractAddr);
    $("#qrCode").html("");

    new QRCode(
        document.getElementById("qrCode"), 
        {
            text: "ethereum:"+contractAddr,
            width: 140, height: 140, colorDark : "#000000", colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        }
    );
    $("#qrCode").show();
}

function confirmTerms() {
    bootbox.confirm({
        message: LANG_CONFIRM_TERMS,
        buttons: { confirm: { label: LANG_CONFIRM_AND_AGREE, className: 'btn-success' },
                   cancel: { label: LANG_DECLINE, className: 'btn-danger' } },
        callback: function (result) { if (!result) { $("body").hide(); } }
    });
}

var scanner, camera;
function setQRScanner() {
    $(".qrcode").on("click",function() {
        var qrcmd = $(this);
        var prv = qrcmd.parent().parent().find(".preview");
        var prvid = $(prv).attr("id");
        var inp = qrcmd.parent().find(".to input");
        var form = qrcmd.parent().find(".form");
        var h3 = qrcmd.parent().find("h3");

        if (scanner) {
            scanner.stop(camera);
            scanner = null;
            $(prv).hide();$(form).show();$(h3).show();
            $(".qrcode").show();
            return;
        }

        scanner = new Instascan.Scanner({ video: document.getElementById(prvid) });

        scanner.addListener('scan', function (content) {
            var cparts = content.split(":");
            $(inp).val(cparts[1]);
            $(prv).hide();$(form).show();$(h3).show();
            scanner.stop(camera);
            scanner = null;
            $(".qrcode").show();
        });

        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 0) {
                camera = cameras[0];
                scanner.start(camera).then(function() {
                    $(prv).show();$(form).hide();$(h3).hide();
                    $(".qrcode").hide();$(qrcmd).show();
                });
            } else {
                bootbox.alert('No cameras found');
                $(prv).hide();$(form).show();$(h3).show();
                $(".qrcode").show();
            }
        }).catch(function (e) {
            bootbox.alert(e);
            $(prv).hide();$(form).show();$(h3).show();
            $(".qrcode").show();
        });
    });
}
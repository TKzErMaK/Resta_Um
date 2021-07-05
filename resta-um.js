const TpTabuleiro = {
    "TRADICIONAL" : "T",
}

const TpPosicao = {
    "PECA" : "*",
    "PECA_SELECIONADA" : "@",
    "ESPACO_INACESSIVEL" : "#",
    "ESPACO_ACESSIVEL" : "%",
    "ESPACO_JOGAVEL" : "$",
}

var clockInterval = new Array();
var q = -1
var clockElement;
var hour = 0
var minute = 0
var second = 0;

var nrPecaRestante = 0;

var arrTabuleiro = new Array();

var objMortesPossiveis = new Object();

(() => {
    clockElement = document.querySelector("#cronometro")
})()

function iniciarJogo(indTpTabuleiro) {
    
    popularTabuleiroInicial(indTpTabuleiro);

    tratarCronometro();
    
    setNrPeca();

    $("#status").text("");
    
    refreshTabuleiro();

}

function tratarCronometro() {
    
    stop();
    start();

}

function setNrPeca(){
 
    $("#nrPeca").val(nrPecaRestante + " Peças");

}

function popularTabuleiroInicial(indTpTabuleiro) {

    switch (indTpTabuleiro) {
        case TpTabuleiro.TRADICIONAL:
           popularTabuleiroTradicional();
           break;
        default:
            $("#status").text("Algo de errado não está certo!");
            break;   
    }

}

function popularTabuleiroTradicional() {
    
    var arr = new Array();

    for (let i = 0; i < 7; i++) {
        
        var arrLinhaTabuleiro = new Array();

        for (let j = 0; j < 7; j++) {
            
            if (i <=  1 || i >= 5) {
                
                if (j >= 2 && j <= 4) {
                    arrLinhaTabuleiro.push(TpPosicao.PECA);
                } else {
                    arrLinhaTabuleiro.push(TpPosicao.ESPACO_INACESSIVEL);
                }

            } else {
                
                if (i == 3) {
                    
                    if (j == 3) {
                        arrLinhaTabuleiro.push(TpPosicao.ESPACO_ACESSIVEL);
                    } else {
                        arrLinhaTabuleiro.push(TpPosicao.PECA);
                    }

                } else {
                    arrLinhaTabuleiro.push(TpPosicao.PECA);
                }

            }


        }
        
        arr.push(arrLinhaTabuleiro);

    }

    nrPecaRestante = 32;

    arrTabuleiro = arr;

}

function refreshTabuleiro() {
    
    var tabuleiroHtml = "";

    for (let i = 0; i < arrTabuleiro.length; i++) {
        
        tabuleiroHtml += "<tr>";
       
        for (let j = 0; j < arrTabuleiro[i].length; j++) {
            
            if (isPeca(arrTabuleiro[i][j])) {
               
                tabuleiroHtml += "<td class='td-peca'>"

                var classPeca = "peca";

                if (arrTabuleiro[i][j] == TpPosicao.PECA_SELECIONADA) {
                    classPeca += " selected";
                }

                tabuleiroHtml += "<div class='"+classPeca+"' onclick='select(" + i + ", " + j +")'>&nbsp;</div>";

                tabuleiroHtml += "</td>";

            } else if (isLugarMovivel(arrTabuleiro[i][j])) {
               
                tabuleiroHtml += "<td><div class='lugar-vago' onclick='move(" + i + ", " + j +", this)'>&nbsp;</div></td>";

            } else if (isLugarInacessivel(arrTabuleiro[i][j])) {
               
                tabuleiroHtml += "<td class='lugar-inacessivel'>&nbsp;</td>";

            } else {
               
                tabuleiroHtml += "<td>&nbsp;</td>";
            } 

        }
        tabuleiroHtml += "</tr>";
    }

    $("#tabuleiroBody").html(tabuleiroHtml); 

}

function isPeca(indTpPosicao) {
    
    if (indTpPosicao == TpPosicao.PECA || indTpPosicao == TpPosicao.PECA_SELECIONADA) {
        return true;
    } else {
        return false;
    }

}

function isLugarMovivel(indTpPosicao) {
    if(indTpPosicao == TpPosicao.ESPACO_JOGAVEL) {
        return true;
    }
    else {
        return false;
    }
}

function isLugarInacessivel(indTpPosicao) {
   
    if(indTpPosicao == TpPosicao.ESPACO_INACESSIVEL) {
        return true;
    } else {
        return false;
    }
}

function select(x, y) {

    unselectAll();

    arrTabuleiro[x][y] = TpPosicao.PECA_SELECIONADA;
    
    atualizarLugaresDisponiveis(x, y);

    refreshTabuleiro();
}

function unselectAll() {
    
    for (let i = 0; i < arrTabuleiro.length; i++) {
        
        for (let j = 0; j < arrTabuleiro[i].length; j++) {
            
            if (arrTabuleiro[i][j] == TpPosicao.PECA_SELECIONADA) {
                arrTabuleiro[i][j] = TpPosicao.PECA;
            }
            
        }
        
    }
}

function atualizarLugaresDisponiveis(x, y) {
    
    unselectAllEspacoJogavel()
    
    objMortesPossiveis = new Object();

    /*
     * Verifica se a posição acima é clicável
     */

    if (isPosicaoAcimaValida(x, y)) {
      
        arrTabuleiro[x-2][y] = TpPosicao.ESPACO_JOGAVEL;
               
        var objControleMorte = new Object();
        objControleMorte.x = x-1;
        objControleMorte.y = y;    
        
        objMortesPossiveis[(x-2)+"-"+y] = objControleMorte;
    }
  
    /*
     * Verifica se a posição abaixo é clicável
    */

    if (isPosicaoAbaixoValida(x, y)) {
      
        arrTabuleiro[x+2][y] = TpPosicao.ESPACO_JOGAVEL;
               
        var objControleMorte = new Object();
        objControleMorte.x = x+1;
        objControleMorte.y = y;
       
        objMortesPossiveis[(x+2)+"-"+y] = objControleMorte;
    }

    /*
     * Verifica se a posição a esquerda é clicável
    */     
   
    if (isPosicaoEsquerdaValida(x, y)) {
    
        arrTabuleiro[x][y-2] = TpPosicao.ESPACO_JOGAVEL;
                
        var objControleMorte = new Object();
        objControleMorte.x = x;
        objControleMorte.y = y-1;
        
        objMortesPossiveis[x+"-"+(y-2)] = objControleMorte;

    }
  
    /*
     * Verifica se a posição a direita é clicável
    */    
   
    if (isPosicaoDireitaValida(x, y)) {
        
        arrTabuleiro[x][y+2] = TpPosicao.ESPACO_JOGAVEL;
                
        var objControleMorte = new Object();
        objControleMorte.x = x;
        objControleMorte.y = y+1;
       
        objMortesPossiveis[x+"-"+(y+2)] = objControleMorte;
    }

}

function isPosicaoAcimaValida(x, y) {
    
    var isMovimentoValido = false;

    if ((x-2) >= 0) {
        
        if (arrTabuleiro[x-2][y] == TpPosicao.ESPACO_ACESSIVEL) {
            
            if (arrTabuleiro[x-1][y] == TpPosicao.PECA) {
                isMovimentoValido = true;
            }
        }
    }

    return isMovimentoValido;
}

function isPosicaoAbaixoValida(x, y) {
  
    var isMovimentoValido = false;

    if ((x + 2) <= 6) {      
        
        if (arrTabuleiro[x+2][y] == TpPosicao.ESPACO_ACESSIVEL) {
            
            if (arrTabuleiro[x+1][y] == TpPosicao.PECA) {
                isMovimentoValido = true;
            }
        }
    }

    return isMovimentoValido;
}

function isPosicaoEsquerdaValida(x, y) {
    
    var isMovimentoValido = false;

    if ((y-2) >= 0) {
        
        if (arrTabuleiro[x][y-2] == TpPosicao.ESPACO_ACESSIVEL) {
            
            if (arrTabuleiro[x][y-1] == TpPosicao.PECA) {
                isMovimentoValido = true;
            }

        }
    }
    
    return isMovimentoValido;
}

function isPosicaoDireitaValida(x, y) {
    
    var isMovimentoValido = false;

    if ((y+2) >= 0) {
        
        if (arrTabuleiro[x][y+2] == TpPosicao.ESPACO_ACESSIVEL) {
            
            if (arrTabuleiro[x][y+1] == TpPosicao.PECA) {
                isMovimentoValido = true;
            }

        }
    }
    
    return isMovimentoValido;
}

function unselectAllEspacoJogavel() {
    
    for (let i = 0; i < arrTabuleiro.length; i++) {
        
        for (let j = 0; j < arrTabuleiro[i].length; j++) {
            
            if (arrTabuleiro[i][j] == TpPosicao.ESPACO_JOGAVEL) {
                arrTabuleiro[i][j] = TpPosicao.ESPACO_ACESSIVEL;
            }
            
        }
        
    }
}

function move(x, y, element) {

    removerPecaSelecionadaTabuleiro();

    arrTabuleiro[x][y] = TpPosicao.PECA;

    kill(x, y);

    setNrPeca();

    refreshTabuleiro();

    playAudio('move.m4a');

    tratarFimPartida();
}

function playAudio(nmAudio) {
   
    var audio = new Audio(nmAudio);
    audio.play();
}

function kill(x, y) {
  
    if (objMortesPossiveis[x+"-"+y] != undefined) {
        arrTabuleiro[objMortesPossiveis[x+"-"+y].x][objMortesPossiveis[x+"-"+y].y] = TpPosicao.ESPACO_ACESSIVEL;
        nrPecaRestante--;
    }

}

function removerPecaSelecionadaTabuleiro() {
    
    for (let i = 0; i < arrTabuleiro.length; i++) {

        for (let j = 0; j < arrTabuleiro[i].length; j++) {

            if (arrTabuleiro[i][j] == TpPosicao.PECA_SELECIONADA) {
                arrTabuleiro[i][j] = TpPosicao.ESPACO_ACESSIVEL;
                break;
            }

        }

    }
    
}

function tratarFimPartida() {
    
    if (nrPecaRestante == 1) {

        $("#status").text("Você venceu!");
       
        iniciarJogo(TpTabuleiro.TRADICIONAL);

    } else if (isGameOver()) {

        stop();
        playAudio('gameover.mpeg');
        
        if (nrPecaRestante <= 5) {
            setNrPontos(getPontos());
        } else {
            $("#status").text("Você perdeu!");
        }      

    }

}

function isGameOver() {

    var isTerminoGame = true;

    for (var i = 0; i < arrTabuleiro.length; i++) {
        
        for (var j = 0; j < arrTabuleiro[i].length; j++) {

            if (arrTabuleiro[i][j] == TpPosicao.PECA || arrTabuleiro[i][j] == TpPosicao.PECA_SELECIONADA) {
                if (isPosicaoAbaixoValida(i, j)) {
                    isTerminoGame = false;
                    break;
                } else if (isPosicaoAcimaValida(i, j)) {
                    isTerminoGame = false;
                    break;
                } else if (isPosicaoDireitaValida(i, j)){
                    isTerminoGame = false;
                    break;
                } else if (isPosicaoEsquerdaValida(i, j)) {
                    isTerminoGame = false;
                    break;
                }
            }          

        }

    }
    
    return isTerminoGame;
}

function start() {
    update()
    q++
    clockInterval[q] = setInterval(() => {
        update()
    }, 1000)
}

function stop() {
    clearInterval(clockInterval[q])
    q--;
    q = -1
    clockElement;
    hour = 0
    minute = 0
    second = 0;
}

function update() {
    second++
    if (second === 60) {
        second = 0
        minute++
    }
    if (minute === 60) {
        minute = 0
        hour++
    }
    if(clockElement){
        clockElement.value = getWatch()
    }
}

function getWatch() {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`
}

function getPontos() {

    nrPontos = 500;

    if (nrPecaRestante == 5) {
        nrPontos = 100;
    } else if (nrPecaRestante == 4) {
        nrPontos = 200;
    } else if (nrPecaRestante == 3) {
        nrPontos = 300;
    } else if (nrPecaRestante == 2) {
        nrPontos = 400;
    } 

    return nrPontos;
}

function setNrPontos(nrPontos) {

    $("#status").text("Pontos por terminar com " + nrPecaRestante + " peças: " + nrPontos + " pontos");

}
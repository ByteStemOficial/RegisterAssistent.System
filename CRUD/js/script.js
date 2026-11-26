ConsultarPessoas();

/*$("#btnSel").click(function (){
    ConsultarPessoas();
})
 
document.getElementById("btnSel").onclick = function () { 
    ConsultarPessoas();
};
*/

const btnSel = document.getElementById("btnSel");

btnSel.onclick = () => {
  ConsultarPessoas();
};

$("#btnIns").click(function () {
  InserirPessoa();
});

function InserirPessoa() {
  let fileInput = document.getElementById("input_imagem");
  if (fileInput.files[0]) {
    fileInput = fileInput.files[0];
  } else {
    fileInput = "";
  }

  objPessoa = {
    value: sessionStorage.getItem("value"),
    file: fileInput,
    nome: document.getElementById("nome").value,
    sobrenome: document.getElementById("sobrenome").value,
    documento: document.getElementById("documento").value,
    data_nascimento: document.getElementById("data_nascimento").value,
    type: "I",
  };
  execRecord(objPessoa, listRecords);
}

function AtualizarPessoa(idValue) {
  let fileInput = document.getElementById(idValue + "_imagem");
  if (fileInput.files[0]) {
    fileInput = fileInput.files[0];
  } else if (fileInput.getAttribute("src")) {
    fileInput = fileInput.getAttribute("src");
  }
  if (!fileInput) {
    fileInput = "";
  }

  objPessoa = {
    value: sessionStorage.getItem("value"),
    nome: document.getElementById(idValue + "_nome").value,
    sobrenome: document.getElementById(idValue + "_sobrenome").value,
    data_nascimento: document.getElementById(idValue + "_data_nascimento")
      .value,
    documento: document.getElementById(idValue + "_documento").value,
    imagem: fileInput,
    id: idValue,
    type: "U",
  };
  execRecord(objPessoa, listRecords);
}

function DeletarImagem(idValue) {
  objPessoa = {
    value: sessionStorage.getItem("value"),
    id: idValue,
    type: "DI",
  };
  execRecord(objPessoa, listRecords);
}

function DeletarPessoa(idValue) {
  objPessoa = {
    value: sessionStorage.getItem("value"),
    id: idValue,
    type: "D",
  };
  execRecord(objPessoa, listRecords);
}

function ConsultarPessoas() {
  objPessoa = {
    value: sessionStorage.getItem("value"),
    type: "C",
  };
  execRecord(objPessoa, listRecords);
}

function PreVisualizarImagem(idValue) {
  if (!idValue) {
    idValue = "input";
  }
  document.getElementById(idValue + "_preview").style.display = "inline";
  document.getElementById(idValue + "_preview").src =
    window.URL.createObjectURL(
      document.getElementById(idValue + "_imagem").files[0],
    );
}

function execRecord(obj, functionAux) {
  let fObj = new FormData();
  for (let key in obj) {
    fObj.append(key, obj[key]);
  }
  ajaxReq(fObj, functionAux);
}

function ajaxReq(valueData, functionAux) {
  $.ajax({
    url: "exec/",
    data: valueData,
    dataType: "json",
    mimeType: "ISO-8859-1",
    type: "post",
    processData: false,
    cache: false,
    contentType: false,
    success: function (dataOut) {
      if (functionAux) {
        functionAux(dataOut);
      }
    },
    beforeSend: function () {
      $(".modal-loader").css({ display: "flex" });
    },
    complete: function () {
      $(".modal-loader").css({ display: "none" });
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      // status 0 = requisição cancelada (ex.: troca de página), não é erro real
      if (XMLHttpRequest.status === 0) {
        return;
      }
      alert(
        "erro " + XMLHttpRequest.status + ": " + XMLHttpRequest.responseText,
      );
    },
  });
}

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function listRecords(data) {
  document.getElementById("conteudo").innerHTML = "";
  if (data.msg) {
    let msgAux = "";
    for (let key in data.msg) {
      msgAux += " - " + data.msg[key] + "<br/>";
    }
    document.getElementById("logs").innerHTML =
      msgAux + document.getElementById("logs").innerHTML;
  }
  if (data.resultado && data.resultado.length > 0) {
    if (data.resultado[0].redirect) {
      window.location.replace(data.resultado[0].redirect);
      return;
    }
    const campos = [
      ["nome", "Nome", "text"],
      ["sobrenome", "Sobrenome", "text"],
      ["documento", "Documento", "text"],
      ["data_nascimento", "Nascimento", "date"],
    ];
    let html = "<div class='grid-pessoas'>";
    data.resultado.forEach((p) => {
      const id = p.id;
      html += "<div class='card-pessoa box-shadow'>";

      // topo: imagem à esquerda + número do ID ao lado
      html += "<div class='topo-card'>";
      html += "<div class='thumb'>";
      if (p.imagem) {
        html +=
          "<img id='" +
          id +
          "_imagem' src='" +
          esc(p.imagem) +
          "' class='clicavel' title='Clique para excluir a imagem' onclick='DeletarImagem(" +
          id +
          ")'>";
      } else {
        html +=
          "<label for='" +
          id +
          "_imagem' title='Clique para escolher uma imagem'>";
        html += "<img id='" + id + "_preview' style='display:none;'>";
        html += "<span class='ph'>Imagem</span>";
        html += "</label>";
        html +=
          "<input type='file' id='" +
          id +
          "_imagem' name='" +
          id +
          "_imagem' accept='image/*' style='display:none;' onchange='PreVisualizarImagem(" +
          id +
          ")'>";
      }
      html += "</div>";
      html += "<span class='id-num'>" + id + "</span>";
      html +=
        "<input type='hidden' id='" + id + "_id' value='" + esc(id) + "'>";
      html += "</div>";

      // campos
      campos.forEach(([chave, rotulo, tipo]) => {
        html += "<span class='rotulo'>" + rotulo + "</span>";
        html +=
          "<input type='" +
          tipo +
          "' id='" +
          id +
          "_" +
          chave +
          "' value='" +
          esc(p[chave]) +
          "' class='box-shadow-hover'>";
      });

      // ações (sem o botão de imagem)
      html += "<div class='acoes'>";
      html +=
        "<input type='button' class='btn zoom box-shadow-hover' value='SALVAR' onclick='AtualizarPessoa(" +
        id +
        ")'>";
      html +=
        "<input type='button' class='btn zoom box-shadow-hover' value='DELETAR' onclick='DeletarPessoa(" +
        id +
        ")'>";
      html += "</div>";
      html += "</div>";
    });
    html += "</div>";
    document.getElementById("conteudo").innerHTML = html;
  }
}
const selectLog = document.getElementById("posicaoLog");
const moldura = document.getElementById("moldura_conteudo");

function aplicarPosicaoLog(pos) {
  moldura.classList.remove("log-bottom", "log-left", "log-right");
  moldura.classList.add("log-" + pos);
}

let posSalva = "bottom";
try {
  posSalva = localStorage.getItem("posicaoLog") || "bottom";
} catch (e) {}
selectLog.value = posSalva;
aplicarPosicaoLog(posSalva);

selectLog.onchange = () => {
  aplicarPosicaoLog(selectLog.value);
  try {
    localStorage.setItem("posicaoLog", selectLog.value);
  } catch (e) {}
};

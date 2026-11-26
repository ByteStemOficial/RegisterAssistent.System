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
      alert(
        "erro: " +
          XMLHttpRequest.responseText +
          " | errorThrown(" +
          errorThrown +
          ")",
      );
    },
  });
}

function listRecords(data) {
  document.getElementById("conteudo").innerHTML = "";
  if (data.msg) {
    let msgAux = "";
    let obj = data.msg;
    for (let key in obj) {
      msgAux += " - " + obj[key] + "<br/>";
    }
    document.getElementById("logs").innerHTML =
      msgAux + document.getElementById("logs").innerHTML;
  }
  if (data.resultado) {
    if (data.resultado[0].redirect) {
      window.location.replace(data.resultado[0].redirect);
    } else {
      let obj = data.resultado;
      let contentTbody = "<tbody>";
      let contentThead = "";
      let countRecords = 0;
      for (let key in obj) {
        countRecords++;
        objPerson = obj[key];
        let idPessoa = null;
        for (let keyInfo in objPerson) {
          let campoDesabilitado = "";
          let tipoCampo = "text";
          if (countRecords == 1) {
            contentThead += "<th>";
            contentThead += keyInfo;
            contentThead += "</th>";
          }
          if (keyInfo == "id") {
            campoDesabilitado = "disabled";
            idPessoa = objPerson[keyInfo];
          }
          if (keyInfo == "data_nascimento") {
            tipoCampo = "date";
          }
          contentTbody += "<td>";
          if (keyInfo == "imagem") {
            if (objPerson[keyInfo] != "") {
              contentTbody += "<div style='text-align:center;'>";
              contentTbody +=
                "<img id='" +
                objPerson["id"] +
                "_" +
                keyInfo +
                "' style='width:20%;' src='" +
                objPerson[keyInfo] +
                "'>";
              contentTbody +=
                "<input type='button' id='btnDelImg'  style='width:30%;' class='btn zoom box-shadow-hover' value='Excluir' onclick='DeletarImagem(" +
                idPessoa +
                ")'>";
              contentTbody += "</div>";
            } else {
              contentTbody += "<div style='text-align:center;'>";
              contentTbody +=
                "<img id='" +
                objPerson["id"] +
                "_preview' style='width:20%;display:none;' src='" +
                objPerson[keyInfo] +
                "'>";
              contentTbody +=
                "<label for='" +
                objPerson["id"] +
                "_" +
                keyInfo +
                "' id='" +
                objPerson["id"] +
                "_label' class='btn zoom box-shadow-hover'>Imagem</label>";
              contentTbody +=
                "<input type='file' id='" +
                objPerson["id"] +
                "_" +
                keyInfo +
                "' name='" +
                objPerson["id"] +
                "_" +
                keyInfo +
                "' accept='image/*' onchange='PreVisualizarImagem(" +
                objPerson["id"] +
                ")'>";
              contentTbody += "</div>";
            }
          } else {
            contentTbody +=
              "<input type='" +
              tipoCampo +
              "' id='" +
              objPerson["id"] +
              "_" +
              keyInfo +
              "' value='" +
              objPerson[keyInfo] +
              "' class='box-shadow-hover' " +
              campoDesabilitado +
              ">";
          }
          contentTbody += "</td>";
        }
        contentTbody += "<td>";
        contentTbody +=
          "<input type='button' id='btnUpd' class='btn zoom box-shadow-hover' value='SALVAR' onclick='AtualizarPessoa(" +
          idPessoa +
          ")'>";
        contentTbody +=
          "<input type='button' id='btnDel' class='btn zoom box-shadow-hover' value='DELETAR' onclick='DeletarPessoa(" +
          idPessoa +
          ")'>";
        contentTbody += "</td>";
        contentTbody += "</tr>";
      }
      contentThead = "<tr>" + contentThead + "<td>Ações</td></tr>";
      contentTbody += "</tbody>";
      document.getElementById("conteudo").innerHTML +=
        "<table><thead>" +
        contentThead +
        "</thead>" +
        contentTbody +
        "</table>";
    }
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

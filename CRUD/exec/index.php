<?php
    session_start();
    header("Content-type: text/html; charset=utf-8");

	$GLOBALS["result"] = '';
    $GLOBALS["msg"] = '';
    $conn = null;

    $host = "srv804.hstgr.io";
    $user = "u286479776_user";
    $pass = "rXWhqKUYvLwf4Ng";
    $dbname = "u286479776_RA";
    $port = 3306;
 	
    try{
        $conn = new PDO("mysql:host=$host;port=$port;dbname=$dbname",$user,$pass);
        $GLOBALS["msg"] = '"SUCESSO: Conexão com o Banco de Dados foi realizada com sucesso."';
    } catch (PDOException $err){
        echo json_encode(["msg" => ["ERRO: Conexão com o Banco de Dados não realizada. " . $err->getMessage()]]);
        exit;
    }

function LoginDB($conn){
    $GLOBALS["result"] = '';
    $user = isset($_REQUEST["user"]) ? trim($_REQUEST["user"]) : '';
    $pass = isset($_REQUEST["pass"]) ? $_REQUEST["pass"] : '';

    $query = $conn->prepare("SELECT id, nome, senha FROM usuario WHERE usuario = :usuario LIMIT 1");
    $query->bindValue(':usuario', $user);
    $query->execute();
    $row = $query->fetch(PDO::FETCH_ASSOC);

    if ($row && password_verify($pass, $row['senha'])) {
        session_regenerate_id(true);
        $_SESSION['usuario_id'] = $row['id'];
        $_SESSION['usuario_nome'] = $row['nome'];
        // caminho relativo à página de login (raiz do projeto)
        $GLOBALS["result"] = '"resultado" : [{"redirect":"CRUD/index.html"}],';
    } else {
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $GLOBALS["msg"] .= '"Usuário ou senha inválidos."';
    }
}

function LogoutDB(){
    $_SESSION = [];
    session_destroy();
    $GLOBALS["result"] = '"resultado" : [{"redirect":"../index.html"}],';
}

function ConsultarRegistrosDB($conn){
    $GLOBALS["result"] = '';
    $sql = "SELECT id,nome,sobrenome,documento,data_nascimento,imagem FROM pessoa";
    $query = $conn->prepare($sql);
    $query->execute();
    if($query->rowCount() > 0){
        $resultRow = "";
        while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
            if($resultRow){
                $resultRow .= ",";
            }
            $resultRow .= "{
                \"id\":\"".$row['id']."\",
                \"nome\":\"".$row['nome']."\",
                \"sobrenome\":\"".$row['sobrenome']."\",
                \"documento\":\"".$row['documento']."\",
                \"data_nascimento\":\"".$row['data_nascimento']."\",
                \"imagem\":\"".$row['imagem']."\"
            }";
        }
        $GLOBALS["result"] = '"resultado" : [' .$resultRow. '],';
    } else {
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Sem resultado"';
    }
}
function InserirRegistroDB($conn){
    $GLOBALS["result"] = '';
    $fileName = "";
    
    if (isset($_FILES['file'])){
    if ($GLOBALS["msg"]){
        $GLOBALS["msg"] .= ",";
    }
    $msg_file = uploadfile("file");
    if ($msg_file == "success"){
        $msg_file = "Upload executado com sucesso.";
        $fileName = "uploads/".$_FILES["file"]['name'];
    }
    $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - ' . $msg_file . '"';
}
    
    $sql = "INSERT INTO pessoa (nome, sobrenome, documento, data_nascimento, imagem) VALUES (:nome,:sobrenome,:documento,:data_nascimento,:imagem)";
    $query = $conn->prepare($sql);
    $query->bindValue(':nome',$_REQUEST["nome"]);
    $query->bindValue(':sobrenome',$_REQUEST["sobrenome"]);
    $query->bindValue(':documento',$_REQUEST["documento"]);
    $query->bindValue(':data_nascimento',$_REQUEST["data_nascimento"]);
    $query->bindValue(':imagem',$fileName);

    $query->execute();
    if($query->rowCount() > 0){
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Ação INSERT executada com sucesso."';
    } else {
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Sem resultado"';
    }
}

function DeletarImagem($conn){
//    if (ControleAcesso($conn)){
        $GLOBALS["result"] = '';
        $sql = "SELECT id,imagem FROM pessoa WHERE id = :id";
        $query = $conn->prepare($sql);
        $query->bindValue(':id',$_REQUEST["id"]);
        $query->execute();
        if($query->rowCount() > 0){
            while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
                if (file_exists(__DIR__.'/../'.$row['imagem'])){
                    unlink(__DIR__.'/../'.$row['imagem']);
                }
                $sqlAux = "UPDATE pessoa SET imagem=null WHERE id = :id";
                $queryAux = $conn->prepare($sqlAux);
                $queryAux->bindValue(':id',$row["id"]);
                $queryAux->execute();
                if($queryAux->rowCount() > 0){
                    if ($GLOBALS["msg"]){
                        $GLOBALS["msg"] .= ",";
                    }
                    $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Ação para Excluir Imagem executada com sucesso."';
                } else {
                    if ($GLOBALS["msg"]){
                        $GLOBALS["msg"] .= ",";
                    }
                    $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Sem resultado"';
                }
            }
        }
//    }
}

function AtualizarRegistroDB($conn){
    $GLOBALS["result"] = '';
    $fileName = "";
    if (isset($_FILES["imagem"])){
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $msg_file = uploadfile("imagem");
        if ($msg_file == "success"){
            $msg_file = "Upload executado com sucesso.";
            $fileName = "uploads/".$_FILES["imagem"]['name'];
        }
        $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - ' . $msg_file . '"';
    } else {
        $fileName = $_REQUEST["imagem"];
    }
    $sql = "UPDATE pessoa SET nome = :nome, sobrenome = :sobrenome, documento = :documento, data_nascimento = :data_nascimento, imagem = :imagem WHERE id = :id";
    $query = $conn->prepare($sql);
    $query->bindValue(':id',$_REQUEST["id"]);
    $query->bindValue(':nome',$_REQUEST["nome"]);
    $query->bindValue(':sobrenome',$_REQUEST["sobrenome"]);
    $query->bindValue(':documento',$_REQUEST["documento"]);
    $query->bindValue(':data_nascimento',$_REQUEST["data_nascimento"]);
    $query->bindValue(':imagem',$fileName);
    $query->execute();
    if($query->rowCount() > 0){
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Ação INSERT executada com sucesso."';
    } else {
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Sem resultado"';
    }
}

function DeleteRegistroDB($conn){
    $GLOBALS["result"] = '';
    // Verifica se o 'id' foi enviado e não está vazio
    if (!isset($_REQUEST["id"]) || empty($_REQUEST["id"])) {
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Erro: Parâmetro id não informado"';
        return; // Interrompe a execução da função
    }
    $sql = "DELETE FROM pessoa WHERE id = :id";
    $query = $conn->prepare($sql);
    $query->bindValue(':id', $_REQUEST["id"]);
    $query->execute();
    if($query->rowCount() > 0){
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Ação DELETE executada com sucesso."';
    } else {
        if ($GLOBALS["msg"]){
            $GLOBALS["msg"] .= ",";
        }
        $GLOBALS["msg"] .= '"' . date('Y-m-d H:i:s') . ' - Sem resultado"';
    }
}

	/*if ($_REQUEST['type'] == "1"){
    $GLOBALS["msg"] .= '"Teste 1"' . "<br/>";
	} else {
		$GLOBALS["msg"] .= '"erro"' . "<br/>";
	}

	//echo $GLOBALS["msg"] . $GLOBALS["result"];

   	$query_sql = "SELECT id FROM pessoa WHERE nome Like Upper('%marcelo%') Order By data_nascimento";
	$resultado_sql = $conn->prepare($query_sql);
	$resultado_sql->execute();
    if ($resultado_sql->rowCount() != 0){
        $resultRow = "";
        while ($linha_resultado = $resultado_sql->fetch(PDO::FETCH_ASSOC)) {
            if($resultRow){
                $resultRow .= ",";
            }
            $resultRow .= "{
                \"id\":\"".$linha_resultado['id']."\",
                \"nome\":\"".$linha_resultado['nome']."\",
                \"sobrenome\":\"".$linha_resultado['sobrenome']."\",
                \"documento\":\"".$linha_resultado['documento']."\",
                \"data_nascimento\":\"".$linha_resultado['data_nascimento']."\",
                \"imagem\":\"".$linha_resultado['imagem']."\"
            }";
        }
        $GLOBALS["result"] = '"resultado" : [' .$resultRow. '],';
    } else {
        $GLOBALS["msg"] .= '"Não foram encontrados registros para consulta."';
    }
*/
    $type = isset($_REQUEST['type']) ? $_REQUEST['type'] : '';

    if ($type == "LG"){
        LoginDB($conn);
    }else
    if ($type == "LO"){
        LogoutDB();
    }else
    if (!isset($_SESSION['usuario_id'])){
        // não logado: manda de volta para a tela de login
        $GLOBALS["result"] = '"resultado" : [{"redirect":"../index.html"}],';
    }else
    if ($type == "C"){
	ConsultarRegistrosDB($conn);
        }else
    if ($type == "HW"){
        $GLOBALS["msg"] .= '"HELLO WORLD"' . "<br/>";
    }else
    if ($type == "I"){
        InserirRegistroDB($conn);
        ConsultarRegistrosDB($conn);
    }else
    if ($type == "U"){
        AtualizarRegistroDB($conn);
        ConsultarRegistrosDB($conn);
    }else
    if ($type == "D"){
        DeleteRegistroDB($conn);
        ConsultarRegistrosDB($conn);
    }else
    if ($type == "DI"){
        DeletarImagem($conn);
        ConsultarRegistrosDB($conn);
    }

    function uploadfile($id){
        // Pasta onde o arquivo vai ser salvo
        $_UP['pasta'] = '../uploads/';
        // Tamanho máximo do arquivo (em Bytes)
        $_UP['tamanho'] = 1024 * 1024 * 2; // 2Mb
        // Array com as extensões permitidas
        $_UP['extensoes'] = array('jpg', 'png', 'gif');
        // Renomeia o arquivo? (Se true, o arquivo será salvo como .jpg e um nome único)
        $_UP['renomeia'] = false;
        // Array com os tipos de erros de upload do PHP
        $_UP['erros'][0] = 'Não houve erro';
        $_UP['erros'][1] = 'O arquivo no upload é maior do que o limite do PHP';
        $_UP['erros'][2] = 'O arquivo ultrapassa o limite de tamanho especifiado no HTML';
        $_UP['erros'][3] = 'O upload do arquivo foi feito parcialmente';
        $_UP['erros'][4] = 'Não foi feito o upload do arquivo';
        if ($_FILES[$id]['error'] != 0) {
            return "<b style='color:red;'>Não foi possível fazer o upload, erro:<br />" . $_UP['erros'][$_FILES[$id]['error']] . "</b>";
            exit; // Para a execução do script
        }
        // Caso script chegue a esse ponto, não houve erro com o upload e o PHP pode continuar
        // Faz a verificação da extensão do arquivo
        $extensao = strtolower(substr( strrchr($_FILES[$id]['name'], '.'), 1));
        if (array_search($extensao, $_UP['extensoes']) === false) {
            return "<b style='color:red;'>Por favor, envie arquivos com as seguintes extensões: jpg, png ou gif</b>";
        }
        // Faz a verificação do tamanho do arquivo
        else if ($_UP['tamanho'] < $_FILES[$id]['size']) {
            return "<b style='color:red;'>O arquivo enviado é muito grande, envie arquivos de até 2Mb.</b>";
        }
        // O arquivo passou em todas as verificações, hora de tentar movê-lo para a pasta
        else {
            // Primeiro verifica se deve trocar o nome do arquivo
            if ($_UP['renomeia'] == true) {
                // Cria um nome baseado no UNIX TIMESTAMP atual e com extensão .jpg
                $nome_final = time().'.'.$extensao;
            } else {
                // Mantém o nome original do arquivo
                $nome_final = $_FILES[$id]['name'];
            }
            // Depois verifica se é possível mover o arquivo para a pasta escolhida
            if (move_uploaded_file($_FILES[$id]['tmp_name'], $_UP['pasta'] . $nome_final)) {
                // Upload efetuado com sucesso, exibe uma mensagem e um link para o arquivo
                return "success";
            } else {
                return "<b style='color:red;'>erro: Não moveu o arquivo para pasta." . $_FILES[$id]['tmp_name'] . "</b>";
            }
        }
    }

    $GLOBALS["result"] .= '"msg" : [' . $GLOBALS["msg"] . ']';

    echo "{" . $GLOBALS["result"] . "}";
 
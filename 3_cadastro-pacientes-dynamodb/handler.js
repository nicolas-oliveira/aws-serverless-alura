"use strict";

const pacientes = [
  { id: 1, nome: "Maria", dataNascimento: "1984-11-01" },
  { id: 2, nome: "Joao", dataNascimento: "1980-01-16" },
  { id: 3, nome: "Jose", dataNascimento: "1998-06-06" },
];

const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: "PACIENTES",
};

// --------------------------------------------------------------------------//
// --------------------------------------------------------------------------//

module.exports.listarPacientes = async (event) => {
  try {
    let data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

// --------------------------------------------------------------------------//
// --------------------------------------------------------------------------//

module.exports.obterPaciente = async (event) => {
  try {
    const { pacienteId } = event.pathParameters;

    const data = await dynamoDb
      .get({
        ...params,
        Key: {
          paciente_id: pacienteId,
        },
      })
      .promise();

    console.log(data);

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Paciente não existe" }, null, 2),
      };
    }

    const paciente = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(paciente, null, 2),
    };
  } catch (err) {
    console.log(
      "-------------------------------ERROR-----------------------------------------"
    );

    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};
// --------------------------------------------------------------------------//
// --------------------------------------------------------------------------//

module.exports.cadastrarPaciente = async (event) => {
  try {
    let dados = JSON.parse(event.body);

    const { data_nascimento, nome, email, telefone } = dados;

    const paciente = {
      data_nascimento,
      paciente_id: Math.random().toString(16).substr(2, 10),
      nome,
      email,
      telefone,
      status: true,
      criado_em: new Date().getTime(),
      atualizado_em: new Date().getTime(),
    };

    await dynamoDb.put({ TableName: "PACIENTES", Item: paciente }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(paciente, null, 2),
    };
  } catch (err) {
    console.log(
      "-------------------------------ERROR-----------------------------------------"
    );

    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

// --------------------------------------------------------------------------//
// --------------------------------------------------------------------------//

module.exports.atualizarPaciente = async (event) => {
  const { pacienteId } = event.pathParameters;
  try {
    let dados = JSON.parse(event.body);

    const { nome, data_nascimento, email, telefone } = dados;

    await dynamoDb
      .update({
        ...params,
        Key: {
          paciente_id: pacienteId,
        },
        UpdateExpression:
          "SET nome = :nome, data_nascimento = :dt, email = :email," +
          "telefone = :telefone, atualizado_em = :atualizado_em",
        ConditionExpression: "attribute_exists(paciente_id)",
        ExpressionAttributeValues: {
          ":nome": nome,
          ":dt": data_nascimento,
          ":email": email,
          ":telefone": telefone,
          ":atualizado_em": new Date().getTime(),
        },
      })
      .promise();
    return {
      statusCode: 201,
    };
  } catch (err) {
    console.log(
      "-------------------------------ERROR-----------------------------------------"
    );

    console.log("Error", err);

    let error = err.name ? err.name : "Exception";
    let message = err.message ? err.message : "Unknown error";
    let statusCode = err.statusCode ? err.statusCode : 500;

    if (error == "ConditionalCheckFailedException") {
      error = "Paciente não existe";
      message = `Recurso com o ID ${pacienteId} não existe e não pode ser atualizado`;
      statusCode = 404;
    }
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error,
        message,
      }),
    };
  }
};

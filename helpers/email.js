import nodemailer from "nodemailer";

//función que envía el correo de confirmación de cuenta cuando se crea un usuario
export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  //información del email
  const info = await transport.sendMail({
    from: '"UpTAsk - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Comprueba tu cuenta",
    text: "Comprueba tu cuenta en Uptask",
    html: `
    <p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
    <p>Tu cuenta ya casi esta lista, solo debes comprobarla en el siguiente enlace:</p>

    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>

    <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
    `
  })
};

//función que envía correo de recuperación de cuenta

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  //información del email
  const info = await transport.sendMail({
    from: '"UpTAsk - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Restablece tu contraseña",
    text: "Restablece tu contraseña",
    html: `
    <p>Hola: ${nombre} has solicitado restablecer tu contraseña</p>

    <p>Sigue el siguiente enlace para generar una nueva contraseña</p>

    <a href="${process.env.FRONTEND_URL}/forgetpwd/${token}">Restablecer Contraseña</a>

    <p>Si tu no solicitaste este correo, puedes ignorar el mensaje</p>
    `,
  })
};
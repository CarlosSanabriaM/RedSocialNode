# Red Social (Node JS)
Este proyecto se trata de una aplicación web realizada para la asignatura "Sistemas Distribuidos e Internet", utilizando la plataforma Node Js.
- **La carpeta *red-social-node*** contiene la aplicación web.
- **La carpeta *red-social-node-test*** contiene un proyecto Java JUnit con una serie de pruebas unitarias, empleando el framework Selenium. Estas comprueban el correcto funcionamiento de la aplicación web.
- **El pdf *Instrucciones*** explica los requisitos necesarios que han de satisfacer tanto la aplicación como los tests.
- **El pdf *Documentacion*** explica cómo se han implementado la aplicación y los tests.


## Información Base de datos
Esta aplicación utiliza una base de datos MongoDB en la nube. Concretamente, utiliza los servicios de [MLab](https://mlab.com). Por tanto, la base de datos original sólo es accesible desde mi cuenta de MLab. 

Sin embargo, se puede crear una cuenta en MLab y crear una nueva base de datos propia para probar la aplicación. Una vez creada la base de datos, se debe crear un usuario para la misma.

Una vez tenemos todo creado, hay que acceder al fichero `app.js` del proyecto *red-social-node* y modificar la cadena de conexión a la base de datos. En la línea `app.set('db', "mongodb://admin:sdi_2018@ds129593.mlab.com:29593/sdi2-uo250707");` hay que cambiar la cadena entre comillas dobles por la que nos indica MLab (<dbuser> debe sustituirse por el nombre del usuario de la BD, y <dbpassword> por su contraseña).

Del mismo modo, si se usa una BD propia en MLab, hay que acceder al proyecto *red-social-node-test* y, en la clase *Mongo.java*, modificar: 
- El nombre de la base de datos por el nuevo en la línea `private static String database = "sdi2-uo250707";`.
- La cadena de conexión en la línea `MongoClientURI connectionString = 
				new MongoClientURI("mongodb://admin:sdi_2018@ds129593.mlab.com:29593/sdi2-uo250707");`.

## Cómo ejecutar la aplicación
Es necesario tener instalado Node.js en el SO. En caso de no tenerlo instalado, se puede desarcargar desde el siguiente enlace https://nodejs.org/es/download/package-manager/.

Hay varias formas para ejecutar, entre ellas:
1. **Desde línea de comandos:** Situarse en la carpeta *red-social-node* desde la línea de comandos y ejecutar el comando: `node app.js`. Para parar el servidor, pulsar `Control + C`.
2. **Utilizando el IDE WebStorm:** Abrir el proyecto *red-social-node* utilizando WebStorm. Hacer click derecho en el archivo *app.js* y seleccionar *Run 'app.js'*.
3.  **Utilizando el IDE Eclipse:** Instalar y habilitar el plugin Nodeclipse del eclipse Marketplace. Importar el proyecto en un workspace. Hacer click derecho en el archivo *app.js* y seleccionar *Run as -> Node.js Application*.

Para visualizar la web, abrir un navegador y visitar la siguiente URL: http://localhost:8081/.


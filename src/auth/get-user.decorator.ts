import { createParamDecorator,ExecutionContext } from "@nestjs/common";


// este decorator es para que cuando lo inyectemos en alguno de nuestros metodos, ejecuta esta funcion y va a obtener el contexto de la peticion, obtiene el objeto request y de este el user (payload del token).


export const GetUser = createParamDecorator(
    (data, context: ExecutionContext)=> {
        const request = context.switchToHttp().getRequest();
        return request.user;
    }
);
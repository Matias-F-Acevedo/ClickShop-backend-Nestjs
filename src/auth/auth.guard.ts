import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
import { Request } from "express";



@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }


    async canActivate(context: ExecutionContext): Promise<boolean> {


        // ExecutionContext :Estas utilidades proporcionan información sobre el contexto de ejecución actual que se puede utilizar para crear protecciones , filtros e interceptores genéricos que pueden funcionar en un amplio conjunto de controladores, métodos y contextos de ejecución.

        //switchToHttp(): es un método proporcionado por el objeto de contexto (context). Este método permite cambiar el contexto a uno específico para las solicitudes HTTP.

        // getRequest(): Una vez que hemos cambiado al contexto de HTTP con switchToHttp(), podemos llamar al método getRequest() para obtener el objeto de solicitud HTTP actual.


        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret, });
            // request["user"] = payload: Si la verificación del token es exitosa, el objeto payload (que parece contener la información del usuario asociado al token JWT) se asigna al objeto de solicitud request. Esto significa que cualquier controlador de ruta que tenga acceso a la solicitud (como los controladores de NestJS) podrá acceder a los datos del usuario a través de request["user"].
            request["user"] = payload;

        } catch (error) {
            throw new UnauthorizedException;
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        // Desestructura la cabecera de autorización y divide en dos partes: type y token.
        // La cabecera de autorización suele tener el formato "Bearer token"(esquema de autenticacion), donde "Bearer" es el tipo y "token" es el token JWT real. Se utiliza el método split(' ') para dividir la cadena en un arreglo en dos elementos.

        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        // Comprueba si el tipo de autorización es 'Bearer' retornando el token, caso contrario undefined.
        return type === 'Bearer' ? token : undefined;
    }
}



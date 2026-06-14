import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('testDeberiaFallarSiCorreoNoEsEmailValido', async () => {
    const dto = new LoginDto();
    dto.correo = 'correo-sin-arroba';
    dto.contraseña = '123456';

    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('correo');
  });

  it('deberia pasar si el correo y contraseña son validos', async () => {
    const dto = new LoginDto();
    dto.correo = 'admin@tienda.com';
    dto.contraseña = '123456';

    const errores = await validate(dto);

    expect(errores.length).toBe(0);
  });
});

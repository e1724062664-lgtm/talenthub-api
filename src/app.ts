import express, { NextFunction, Request, Response } from 'express';
import { time } from 'node:console';
import { nextTick, title } from 'node:process';

const HTTP_STATUS = {
    OK: 200,
    CREATE: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

//Interface: definir la estructura de los objetos vacantes
interface Vacancy {
    id: number;
    title: string;
    company: string;
    modality: string;
    salary: number;
}

//Datos que se espera recibir desde el cliente
type CreateVacancyInput = Omit<Vacancy, 'id'>;

//Revisar datos de entrada
const validateVacancy = (input: Partial<CreateVacancyInput>): string | null => {
    const { title, company, modality, salary } = input;

    if (typeof title !== 'string' || !title.trim() ||
        typeof company !== 'string' || !company.trim() ||
        typeof modality !== 'string' || !modality.trim()) {
        return 'El título, la empresa y la modalidad son obligatorios';
    }
    if (typeof salary !== 'number' || salary <= 0) {
        return 'El salario debe ser un número mayor que 0';
    }
    return null;
};

const app = express();

//Middleware: combierte el JSON que llega en un objeto disponible en req.body
app.use(express.json());

//Datos de prueba en memoria
const vacancies: Vacancy[] = [
    { id: 1, title: 'Desarrollador Backend jr', company: 'Tech Andes', modality: 'remoto', salary: 800 },
    { id: 1, title: 'Analista de datos', company: 'Datasur', modality: 'hibrido', salary: 1100 }
]


let nextId = vacancies.length + 1;

//Ruta get
app.get('/vacancies', (req, res) => {
    res.status(HTTP_STATUS.OK).json(vacancies);
});

//Ruata post
app.post('/vacancies', (req, res) => {
    const input = req.body as CreateVacancyInput;

    const error = validateVacancy(input ?? {});

    if (error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error });
        return;
    }

    //crear la vacante
    const newVacancy: Vacancy = {
        id: nextId++,
        title: input.title.trim(),
        company: input.company.trim(),
        modality: input.modality.trim(),
        salary: input.salary
    };

    vacancies.push(newVacancy);

    res.status(HTTP_STATUS.CREATE).json(newVacancy);
});

app.use((req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Ruta no encontrada' });
});

//Menejo de errores: Express
app.use((error: Error & { status?: number }, req: Request, res: Response, nest: NextFunction) => {
    const status = error.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

    if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) console.error(error);

    res.status(status).json({
        error: status < HTTP_STATUS.INTERNAL_SERVER_ERROR ? 'Lapeticion no es valida' : 'Error interno del servidor',
    });
});

export default app;



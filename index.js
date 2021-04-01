import express from 'express';
import {
    promises as fs
} from 'fs';

const app = express();
app.use(express.json());

app.delete('/grade', async (req, res) => {
    deletaGrade(req.query, res);
});
app.get('/grade/:id', async (req, res) => {
    buscaGrade(req.params, res);
});

app.get('/grade/notaTotalAluno/:student/:subject', async (req, res) => {
    notaTotalAluno(req.params, res);
});

app.get('/grade/mediaGrades/:subject/:type', async (req, res) => {
    mediaGrades(req.params, res);
});

app.get('/grade/top3/:subject/:type', async (req, res) => {
    topGrades(req.params, res);
});

app.put('/grade', async (req, res) => {
    atualizaGrade(req.query, res);
});

app.post('/grade', async (req, res) => {
    inserirGrade(req.query, res);
});

app.listen(3000, () => {
    console.log("teste");
});


async function inserirGrade(grade, res) {
    const gradesFile = JSON.parse(await fs.readFile('json/grades.json', 'utf-8'));
    const id = gradesFile.nextId;
    gradesFile.nextId++;
    const gradeInsert = {
        id: id,
        student: grade.student,
        subject: grade.subject,
        type: grade.type,
        value: grade.value,
        timestamp: new Date()
    };
    gradesFile.grades.push(gradeInsert);
    await fs.writeFile(`json/grades.json`, JSON.stringify(gradesFile));
    res.send(gradeInsert);
}

async function atualizaGrade(grade, res) {
    const gradesFile = JSON.parse(await fs.readFile('json/grades.json', 'utf-8'));
    const id = grade.id;
    const searchedGrade = gradesFile.grades.find(search => search.id == id);
    if (!searchedGrade) {
        res.status(500).send("Grade não encontrada");
        return;
    }
    searchedGrade.student = grade.student ? grade.student : searchedGrade.student;
    searchedGrade.subject = grade.subject ? grade.subject : searchedGrade.subject;
    searchedGrade.type = grade.type ? grade.type : searchedGrade.type;
    searchedGrade.value = grade.value ? grade.value : searchedGrade.value;
    searchedGrade.timestamp = new Date();
    await fs.writeFile(`json/grades.json`, JSON.stringify(gradesFile));
    res.send(searchedGrade);
}

async function deletaGrade(grade, res) {
    const gradesFile = JSON.parse(await fs.readFile('json/grades.json', 'utf-8'));
    const id = grade.id;
    const searchedGrade = gradesFile.grades.findIndex(search => search.id == id);
    if (searchedGrade == -1) {
        res.status(500).send("Grade não encontrada");
        return;
    }
    gradesFile.grades.splice(searchedGrade, 1);
    await fs.writeFile(`json/grades.json`, JSON.stringify(gradesFile));
    res.send();
}

async function buscaGrade(grade, res) {
    const gradesFile = JSON.parse(await fs.readFile('json/grades.json', 'utf-8'));
    const id = grade.id;
    const searchedGrade = gradesFile.grades.find(search => search.id == id);
    if (!searchedGrade) {
        res.status(500).send("Grade não encontrada");
        return;
    }
    res.send(searchedGrade);
}

async function notaTotalAluno(grade, res) {
    const gradesFile = JSON.parse(await fs.readFile('json/grades.json', 'utf-8'));
    const student = grade.student;
    const subject = grade.subject;
    const searchedGrades = gradesFile.grades.filter(search => search.student == student && search.subject == subject);
    if (!searchedGrades) {
        res.status(500).send("Grade não encontrada");
        return;
    }
    let nota = 0;
    searchedGrades.forEach(searchedGrade => {
        nota += Number(searchedGrade.value);
    });
    res.send({
        nota: nota
    });
}

async function mediaGrades(grade, res) {
    const gradesFile = JSON.parse(await fs.readFile('json/grades.json', 'utf-8'));
    const type = grade.type;
    const subject = grade.subject;
    const searchedGrades = gradesFile.grades.filter(search => {
        return search.type == type && search.subject == subject
    });
    if (!searchedGrades || searchedGrades.length == 0) {
        res.status(500).send("Grade não encontrada");
        return;
    }
    let nota = 0;
    searchedGrades.forEach(searchedGrade => {
        nota += Number(searchedGrade.value);
    });
    res.send({
        nota: (nota / searchedGrades.length)
    });
}

async function topGrades(grade, res) {
    const gradesFile = JSON.parse(await fs.readFile('json/grades.json', 'utf-8'));
    const type = grade.type;
    const subject = grade.subject;
    const searchedGrades = gradesFile.grades.filter(search => search.type == type && search.subject == subject);
    if (!searchedGrades || searchedGrades.length == 0) {
        res.status(500).send("Grade não encontrada");
        return;
    }
    let nota = 0;
    searchedGrades.sort((a, b) => {
        return Number(b.value) - Number(a.value);
    });
    res.send(searchedGrades.splice(0, 3));
}
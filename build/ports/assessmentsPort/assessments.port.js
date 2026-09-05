"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AssessmentsPort {
    constructor() { }
    static async getAssessments() {
        const response = await fetch('http://localhost:3000/assessments');
        return response.json();
    }
    static async registryAssessment(assessment) {
        const response = await fetch('http://localhost:3000/assessments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assessment)
        });
        return response.json();
    }
}
exports.default = AssessmentsPort;
//# sourceMappingURL=assessments.port.js.map
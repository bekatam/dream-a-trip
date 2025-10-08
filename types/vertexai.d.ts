declare module '@google-cloud/vertexai' {
  export class VertexAI {
    constructor(options: { project: string; location: string });
    getGenerativeModel(options: { model: string }): {
      generateContent(input: any): Promise<any>;
    };
  }
}



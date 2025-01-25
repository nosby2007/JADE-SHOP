

export interface Patient {
    id?: string;
    name: string;
    gender: string;
    dob: Date;
    address: string;
    phone: string;
    email: string;
    quartier: string;
    docteur: string;
    departement: string;
    raison: string;
    paiement: string;
    Ename: string;
    relationship: string;
    Ephone: string;
    reference: string;
    admission: string;
    code: string;
    allergie: string;
  };


  export class Patient{
    firstName!: string;
    lastName!: string;
    email!: string;
    Department!: string;
    phone!: string;
    ordre!:number;
    profession!: string;
    gender!: string;
    region!: string;
    date!: string;
    EMContact!: string;
    cni!: number;
    docteur!:string;
    age!:number;
    adresse!:string;
    typatient!:string;
    barre!:number;
    paiement!:string;
}
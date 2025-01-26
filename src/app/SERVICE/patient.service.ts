import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from '../patient.model';
import { collectionData } from '@angular/fire/firestore';
import { addDoc, doc, updateDoc } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientCollection: AngularFirestoreCollection<Patient>;
  patient$: Observable<Patient[]>;
  

  constructor(private firestore: AngularFirestore) {
    this.patientCollection = this.firestore.collection<Patient>('patients');
    this.patient$ = this.patientCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Patient;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  getPatients(): Observable<Patient[]> {
    return this.patient$;
  }

  getPatientById(id: string): Observable<Patient | undefined> {
    return this.patientCollection.doc(id).snapshotChanges().pipe(
      map(action => {
        const data = action.payload.data() as Patient;
        const id = action.payload.id;
        return { id, ...data };
      })
    );
  }

  addPatient(patient: Patient): Promise<void> {
    return this.patientCollection.add(patient).then(() => {}); // Explicitly returning void
  }

  updatePatient(id: string, patient: Partial<Patient>): Promise<void> {
    return this.patientCollection.doc(id).update(patient);
  }

  deletePatient(id: string): Promise<void> {
    return this.patientCollection.doc(id).delete();
  }



  getAllPrescriptions(): Observable<any[]> {
    return this.firestore
      .collectionGroup('prescriptions')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Données brutes depuis Firebase
            const id = a.payload.doc.id;
  
            // Validation pour s'assurer que data est un objet
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si data est invalide
            }
          })
        )
      );
  }
  getAllProgressNote(): Observable<any[]> {
    return this.firestore
      .collectionGroup('progressNote')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Données brutes depuis Firebase
            const id = a.payload.doc.id;
  
            // Validation pour s'assurer que data est un objet
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si data est invalide
            }
          })
        )
      );
  }
  getAllAllergy(): Observable<any[]> {
    return this.firestore
      .collectionGroup('allergy')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Données brutes depuis Firebase
            const id = a.payload.doc.id;
  
            // Validation pour s'assurer que data est un objet
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si data est invalide
            }
          })
        )
      );
  }
  getAllVaccin(): Observable<any[]> {
    return this.firestore
      .collectionGroup('vaccinations')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Données brutes depuis Firebase
            const id = a.payload.doc.id;
  
            // Validation pour s'assurer que data est un objet
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si data est invalide
            }
          })
        )
      );
  }
  getAllDiagnostic(): Observable<any[]> {
    return this.firestore
      .collectionGroup('diagnostic')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Données brutes depuis Firebase
            const id = a.payload.doc.id;
  
            // Validation pour s'assurer que data est un objet
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si data est invalide
            }
          })
        )
      );
  }

  getAllPatients(): Observable<any[]> {
    return this.firestore
      .collection('patients')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID et les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  getAllVitals(): Observable<any[]> {
    return this.firestore
      .collection('vitals')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID et les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  getAllAssessment(): Observable<any[]> {
    return this.firestore
      .collection('assessment')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID et les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  getAllAntibiotic(): Observable<any[]> {
    return this.firestore
      .collection('antibiotic')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID et les données
            } else {
              console.error('Données non valides :', data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  
  
  getPrescriptions(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/prescriptions`)
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const rawData = a.payload.doc.data();
            const id = a.payload.doc.id;
  
            // Crée une copie sécurisée des données
            return Object.assign({ id }, rawData || {}); // Utilisation de Object.assign
          });
        })
      );
  }
  getProgressNote(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/progressNote`)
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const rawData = a.payload.doc.data();
            const id = a.payload.doc.id;
  
            // Crée une copie sécurisée des données
            return Object.assign({ id }, rawData || {}); // Utilisation de Object.assign
          });
        })
      );
  }
  getDiagnostic(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/diagnostic`)
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const rawData = a.payload.doc.data();
            const id = a.payload.doc.id;
  
            // Crée une copie sécurisée des données
            return Object.assign({ id }, rawData || {}); // Utilisation de Object.assign
          });
        })
      );
  }
  getAllergies(patientId: string): Observable<any[]> {
    console.log(`Récupération des allergies : patients/${patientId}/allergy`);
    return this.firestore
      .collection(`patients/${patientId}/allergy`) // Utilisation correcte de "allergy"
      .valueChanges({ idField: 'id' });
  }
  getVaccin(patientId: string): Observable<any[]> {
    console.log(`Récupération des vaccin : patients/${patientId}/vaccinations`);
    return this.firestore
      .collection(`patients/${patientId}/vaccinations`) // Utilisation correcte de "allergy"
      .valueChanges({ idField: 'id' });
  }
  getVitals(patientId: string): Observable<any[]> {
    console.log(`Récupération des vaccin : patients/${patientId}/vitals`);
    return this.firestore
      .collection(`patients/${patientId}/vitals`) // Utilisation correcte de "signe vitaux"
      .valueChanges({ idField: 'id' });
  }

  getAntibiotic(patientId: string): Observable<any[]> {
    console.log(`Récupération des vaccin : patients/${patientId}/antibiotic`);
    return this.firestore
      .collection(`patients/${patientId}/antibiotic`) // Utilisation correcte de "signe vitaux"
      .valueChanges({ idField: 'id' });
  }
  


  getPrescriptionsByPatient(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/prescriptions`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Récupère les données
            const id = a.payload.doc.id; // Récupère l'ID du document
  
            // Validation des données avant l'utilisation de l'opérateur spread
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides pour le document avec ID :', id, data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  getProgressNoteByPatient(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/progressNote`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Récupère les données
            const id = a.payload.doc.id; // Récupère l'ID du document
  
            // Validation des données avant l'utilisation de l'opérateur spread
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides pour le document avec ID :', id, data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  
  getDiagnosticByPatient(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/diagnostic`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Récupère les données
            const id = a.payload.doc.id; // Récupère l'ID du document
  
            // Validation des données avant l'utilisation de l'opérateur spread
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides pour le document avec ID :', id, data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  getVaccinationsByPatient(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/vaccinations`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Récupère les données
            const id = a.payload.doc.id; // Récupère l'ID du document
  
            // Validation des données avant l'utilisation de l'opérateur spread
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides pour le document avec ID :', id, data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  getAllergyByPatient(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/allergy`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Récupère les données
            const id = a.payload.doc.id; // Récupère l'ID du document
  
            // Validation des données avant l'utilisation de l'opérateur spread
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides pour le document avec ID :', id, data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  getAntibioticByPatient(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/antibiotic`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Récupère les données
            const id = a.payload.doc.id; // Récupère l'ID du document
  
            // Validation des données avant l'utilisation de l'opérateur spread
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides pour le document avec ID :', id, data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  getAssessmentByPatient(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/assessment`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Récupère les données
            const id = a.payload.doc.id; // Récupère l'ID du document
  
            // Validation des données avant l'utilisation de l'opérateur spread
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides pour le document avec ID :', id, data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  getVitalsByPatient(patientId: string): Observable<any[]> {
    return this.firestore
      .collection(`patients/${patientId}/vitals`)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data(); // Récupère les données
            const id = a.payload.doc.id; // Récupère l'ID du document
  
            // Validation des données avant l'utilisation de l'opérateur spread
            if (data && typeof data === 'object') {
              return { id, ...data }; // Combine l'ID avec les données
            } else {
              console.error('Données non valides pour le document avec ID :', id, data);
              return { id }; // Retourne uniquement l'ID si les données sont invalides
            }
          })
        )
      );
  }
  

  addPrescription(patientId: string, prescription: any): Promise<void> {
    console.log('Path:', `patients/${patientId}/prescriptions`);
    console.log('Data to Add:', prescription);
  
    return this.firestore
      .collection(`patients/${patientId}/prescriptions`)
      .add(prescription)
      .then(() => {
        console.log('Prescription ajoutée avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de la prescription :', error);
        throw error;
      });
  }
  addProgressNote(patientId: string, progressNote: any): Promise<void> {
    console.log('Path:', `patients/${patientId}/progressNote`);
    console.log('Data to Add:', progressNote);
  
    return this.firestore
      .collection(`patients/${patientId}/progressNote`)
      .add(progressNote)
      .then(() => {
        console.log('progressNote ajoutée avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de la progressNote :', error);
        throw error;
      });
  }
  
  addDiagnostic(patientId: string, diagnostic: any): Promise<void> {
    console.log('Path:', `patients/${patientId}/diagnostic`);
    console.log('Data to Add:', diagnostic);
  
    return this.firestore
      .collection(`patients/${patientId}/diagnostic`)
      .add(diagnostic)
      .then(() => {
        console.log('diagnostic ajoutée avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de la diagnostic :', error);
        throw error;
      });
  }
  addAllergy(patientId: string, allergy: any): Promise<void> {
    console.log('Path:', `patients/${patientId}/allergy`);
    console.log('Data to Add:', allergy);
  
    return this.firestore
      .collection(`patients/${patientId}/allergy`)
      .add(allergy)
      .then(() => {
        console.log('Allergy ajoutée avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de l\'allergie :', error);
        throw error;
      });
  }
  addVaccinations(patientId: string, vaccination: any): Promise<void> {
    console.log('Path:', `patients/${patientId}/vaccinations`);
    console.log('Data to Add:', vaccination);
  
    return this.firestore
      .collection(`patients/${patientId}/vaccinations`)
      .add(vaccination)
      .then(() => {
        console.log('Vaccination ajoutée avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de la vaccination:', error);
        throw error;
      });
  }
  addVitals(patientId: string, vitals: any): Promise<void> {
    console.log('Path:', `patients/${patientId}/vitals`);
    console.log('Data to Add:', vitals);
  
    return this.firestore
      .collection(`patients/${patientId}/vitals`)
      .add(vitals)
      .then(() => {
        console.log('signes vitaux  ajoutée avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout des signes vitaux:', error);
        throw error;
      });
  }
  
  
    // Marquer une tâche comme effectuée
    markPrescriptionAsDone(patientId: string, prescriptionId: string): Promise<void> {
      return this.firestore
        .doc(`patients/${patientId}/prescriptions/${prescriptionId}`)
        .update({ status: 'done' });
    }  
    updatePrescriptionStatus(patientId: string, prescriptionId: string, data: any): Promise<void> {
      return this.firestore
        .collection(`patients/${patientId}/prescriptions`)
        .doc(prescriptionId)
        .update(data);
    }
    
    updateAllergy(patientId: string, allergyId: string, allergy: any): Promise<void> {
      return this.firestore
        .doc(`patients/${patientId}/allergy/${allergyId}`)
        .update(allergy)
        .then(() => {
          console.log('allergy updated successfully.');
        })
        .catch(error => {
          console.error(`Error updating allergy ${allergyId}:`, error);
        });
    }
    updateVaccination(patientId: string, vaccinationId: string, allergy: any): Promise<void> {
      return this.firestore
        .doc(`patients/${patientId}/vaccinations/${vaccinationId}`)
        .update(allergy)
        .then(() => {
          console.log('allergy updated successfully.');
        })
        .catch(error => {
          console.error(`Error updating allergy ${vaccinationId}:`, error);
        });
    }
     // Supprimer ou barrer une allergie
    deleteAllergy(patientId: string, allergyId: string): Promise<void> {
      console.log(`Suppression de l'allergie : patients/${patientId}/allergy/${allergyId}`);
      return this.firestore
        .collection(`patients/${patientId}/allergy`) // Utilisation correcte de "allergy"
        .doc(allergyId)
        .delete()
        .then(() => console.log('Suppression réussie dans Firebase'))
        .catch((error) => {
          console.error('Erreur Firebase lors de la suppression :', error);
          throw error; // Renvoyer l'erreur pour gérer dans le composant
        });
    }
    deleteAntibiotic(patientId: string, antibioticId: string): Promise<void> {
      console.log(`Suppression de l'allergie : patients/${patientId}/antibiotic/${antibioticId}`);
      return this.firestore
        .collection(`patients/${patientId}/antibiotic`) // Utilisation correcte de "vaccination"
        .doc(antibioticId)
        .delete()
        .then(() => console.log('Suppression réussie dans Firebase'))
        .catch((error) => {
          console.error('Erreur Firebase lors de la suppression :', error);
          throw error; // Renvoyer l'erreur pour gérer dans le composant
        });
    }
    deleteAssessment(patientId: string, assessmentId: string): Promise<void> {
      console.log(`Suppression de l'allergie : patients/${patientId}/assessment/${assessmentId}`);
      return this.firestore
        .collection(`patients/${patientId}/assessment`) // Utilisation correcte de "assessment"
        .doc(assessmentId)
        .delete()
        .then(() => console.log('Suppression réussie dans Firebase'))
        .catch((error) => {
          console.error('Erreur Firebase lors de la suppression :', error);
          throw error; // Renvoyer l'erreur pour gérer dans le composant
        });
    }
    deleteVaccination(patientId: string, vaccinationId: string): Promise<void> {
      console.log(`Suppression de l'allergie : patients/${patientId}/vaccinations/${vaccinationId}`);
      return this.firestore
        .collection(`patients/${patientId}/vaccinations`) // Utilisation correcte de "vaccination"
        .doc(vaccinationId)
        .delete()
        .then(() => console.log('Suppression réussie dans Firebase'))
        .catch((error) => {
          console.error('Erreur Firebase lors de la suppression :', error);
          throw error; // Renvoyer l'erreur pour gérer dans le composant
        });
    }
    
    

    updateMissingPrescriptionDates(): void {
      this.firestore.collection('patients').get().subscribe(snapshot => {
        snapshot.forEach(doc => {
          const patientRef = doc.ref;
          const prescriptionsRef = patientRef.collection('prescriptions');
    
          prescriptionsRef.get().then(prescriptionSnapshot => {
            prescriptionSnapshot.forEach(prescriptionDoc => {
              const data = prescriptionDoc.data();
              if (!data['startDate'] || !data['endDate']) {
                prescriptionDoc.ref.update({
                  startDate: data['startDate'] || new Date().toISOString(),
                  endDate: data['endDate'] || new Date().toISOString(),
                }).then(() => {
                  console.log(`Prescription mise à jour : ${prescriptionDoc.id}`);
                });
              }
            });
          });
        });
      });
    }
    
    
    updateTask(patientId: string, prescriptionId: string, updatedData: any): Promise<void> {
      return this.firestore
        .doc(`patients/${patientId}/prescriptions/${prescriptionId}`)
        .update(updatedData)
        .then(() => {
          console.log('Task updated successfully.');
        })
        .catch(error => {
          console.error(`Error updating task ${prescriptionId}:`, error);
        });
    }
    
    // Ajouter une nouvelle évaluation
  async addAssessment(patientId: string, assessment: any): Promise<void> {
    console.log('Path:', `patients/${patientId}/assessment`);
    console.log('Data to Add:', assessment);
  
    return this.firestore
      .collection(`patients/${patientId}/assessment`)
      .add(assessment)
      .then(() => {
        console.log('Prescription ajoutée avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de l\'assessement', error);
        throw error;
      });
  }
  async addAntibiotic(patientId: string, assessment: any): Promise<void> {
    console.log('Path:', `patients/${patientId}/antibiotic`);
    console.log('Data to Add:', assessment);
  
    return this.firestore
      .collection(`patients/${patientId}/antibiotic`)
      .add(assessment)
      .then(() => {
        console.log('Prescription ajoutée avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de l\'assessement', error);
        throw error;
      });
  }

  // Mettre à jour une évaluation
  async updateAssessment(patientId: string, assessmentId: string, updatedData: any): Promise<void> {
    return this.firestore
        .doc(`patients/${patientId}/assessment/${assessmentId}`)
        .update(updatedData)
        .then(() => {
          console.log('Task updated successfully.');
        })
        .catch(error => {
          console.error(`Error updating task ${assessmentId}:`, error);
        });
  }

  // Obtenir toutes les évaluations d'un patient
  getAssessments(patientId: string): Observable<any[]> {
    console.log(`Récupération des vaccin : patients/${patientId}/assessment`);
    return this.firestore
      .collection(`patients/${patientId}/assessment`) // Utilisation correcte de "signe vitaux"
      .valueChanges({ idField: 'id' });
  }

  // Calculer la prochaine date d'évaluation
  calculateNextDueDate(routine: string): Date {
    const today = new Date();
    if (routine === 'weekly') {
      today.setDate(today.getDate() + 7);
    } else if (routine === 'monthly') {
      today.setMonth(today.getMonth() + 1);
    }
    return today;
  }
   
    
  
}

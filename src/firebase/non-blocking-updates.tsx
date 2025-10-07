
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  const promise = setDoc(docRef, data, options || {});
  promise.catch(error => {
    // Check if the error has a code property, which is common for Firebase errors
    if (error && error.code === 'permission-denied') {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: (options && 'merge' in options) ? 'update' : 'create',
            requestResourceData: data,
          })
        )
    } else {
        // For other types of errors, you might want to log them or handle them differently
        console.error("An unexpected error occurred during setDoc:", error);
    }
  });
  return promise;
}


/**
 * Initiates an addDoc operation for a collection reference.
 * This function is designed to be awaited and will throw on error.
 * Returns the DocumentReference on success.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any): Promise<DocumentReference> {
  return addDoc(colRef, data).catch(error => {
    const permissionError = new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the original error to be caught by the caller
    throw error;
  });
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  const promise = updateDoc(docRef, data);
  promise.catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
  return promise;
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  const promise = deleteDoc(docRef);
  promise.catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
  return promise;
}

    

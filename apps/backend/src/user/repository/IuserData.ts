/**
 * Interface to impose user data format on database. 
 * Interface being used on repository layer so thus does not need
 * to know about higher level data abstraction
 */

export interface IuserData {
    firebaseUid?: string;
    username?: string;
    email?: string;
    role?: string;
    isBanned?: boolean;
}
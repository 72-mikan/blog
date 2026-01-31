import { CredentialsSignin } from "next-auth";

export class CustomCredentialsSignin extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.message = message;
  }
}
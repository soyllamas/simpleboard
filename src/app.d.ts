import type {RequestLogger} from "evlog";

declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
		}

		interface Locals {
			log: RequestLogger;
		}

		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

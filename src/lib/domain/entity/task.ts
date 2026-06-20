export type Task = {
	id: string;
	status: 'todo' | 'doing' | 'done';
	title: string;
	updatedAt?: TaskDate;
	editable: boolean;
	instance: HTMLDivElement;
};

export type TaskDate =
	| string
	| number
	| Date
	| {
			toDate: () => Date;
	  }
	| {
			seconds: number;
	  };

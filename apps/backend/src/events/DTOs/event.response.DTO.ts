import { Exclude, Expose, Transform, Type } from 'class-transformer';

  class EventPlaceDTO {
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    _id: string;

    @Expose() name: string;
    @Expose() address: string;
  }

export class EventResponseDTO {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  date: Date;

  @Expose()
  location: string;

  @Expose()
  @Type(() => EventPlaceDTO)
  place: any; // Can be populated with Place details

  @Expose()
  privacy: string;

  @Expose()
  @Transform(({ obj }) => {
    const host = obj.host;
    if (!host) return null;
    return {
      ...host,
      _id: host._id?.toString(),
    };
  })
  host: any; // Can be populated with User details

  @Expose()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((u: any) =>
          u && typeof u === 'object'
            ? { ...u, _id: u._id?.toString() }
            : { _id: u?.toString?.() ?? String(u) },
        )
      : [],
  )
  attendees: any[]; // Can be populated with User details

  @Expose()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((u: any) =>
          u && typeof u === 'object'
            ? { ...u, _id: u._id?.toString() }
            : { _id: u?.toString?.() ?? String(u) },
        )
      : [],
  )
  invitedFriends: any[]; // Can be populated with User details

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // No fields to exclude - all are public
}
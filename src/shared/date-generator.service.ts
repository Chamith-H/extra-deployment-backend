import * as moment from 'moment-timezone';

export class DateGeneratorService {
  async convertSapDate(date: string, time: number) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);

    const hours = Math.floor(time / 100)
      .toString()
      .padStart(2, '0');
    const minutes = (time % 100).toString().padStart(2, '0');

    // Create moment object in Sri Lanka timezone
    const dateTime = moment.tz(
      `${year}-${month}-${day} ${hours}:${minutes}`,
      'YYYY-MM-DD HH:mm',
      'Asia/Colombo',
    );

    // Format directly in Sri Lanka time (local ISO format)
    const dateTimeStr = dateTime.format('YYYY-MM-DDTHH:mm:ss');

    return dateTimeStr;
  }
}

import * as moment from 'moment-timezone';

export class DateGeneratorService {
  //!--> Convert date text to UTC
  async convert_singleDate(dateText: string): Promise<Date> {
    const dateUtc = moment.utc(dateText).toDate();
    return dateUtc;
  }

  //!--> Get today, current date
  async getTodayDate() {
    const dateToday = new Date();
    const dateString = dateToday.toISOString();
    const dateUtc = await this.convert_singleDate(dateString);
    return dateUtc;
  }

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

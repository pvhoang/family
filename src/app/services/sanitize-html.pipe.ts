import { Pipe, Injectable } from '@angular/core';
// import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'keepHtml',
})
@Injectable()
export class KeepHtmlPipe {

  constructor(private sanitizer: DomSanitizer) {
  }

  transform(content) {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

}

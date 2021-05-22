import {Context, SelectorDirective} from "common"

class HeadDirective extends SelectorDirective {
  lang = "fr"

  constructor() {
    super("rr0-head")
  }

  protected async handle(context: Context, el: HTMLElement) {
    el.innerHTML = `<!DOCTYPE html>
<html data-ng-app="rr0" lang="<!--#if expr="${this.lang}" --><!--#echo var="lang" --><!--#else -->fr<!--#endif -->">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <link rel="stylesheet" media="print" href="/print.css" type="text/css"/>
  <link rel="dns-prefetch" href="//google.com">
  <link rel="dns-prefetch" href="//googleapis.com">
  <link rel="dns-prefetch" href="//facebook.com">
  <link rel="dns-prefetch" href="//twitter.com">
  <link href="http://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,400,600" rel="stylesheet" type="text/css">
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="/rr0.css" type="text/css"/>
  <!--[if lt IE 9]>
  <script src="//html5shim.googlecode.com/svn/trunk/html5.js"></script>
  <script src="http://css3-mediaqueries-js.googlecode.com/svn/trunk/css3-mediaqueries.js"></script><![endif]-->
  <meta name="viewport" content="initial-scale=1, maximum-scale=1.0, user-scalable=no">
  <base target="_top"/>
  <meta ng-transclude>
</head>`
  }
}
﻿/*
 * Copyright (c) 2003-2022. PengYunNetWork
 *
 * This program is free software: you can use, redistribute, and/or modify it
 * under the terms of the GNU Affero General Public License, version 3 or later ("AGPL"),
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 *  You should have received a copy of the GNU Affero General Public License along with
 *  this program. If not, see <http://www.gnu.org/licenses/>.
 */
CKEDITOR.skin.name="kama";CKEDITOR.skin.ua_editor="ie,iequirks,ie7,ie8";CKEDITOR.skin.ua_dialog="ie,iequirks,ie7,ie8";
CKEDITOR.skin.chameleon=function(e,d){function b(a){return"background:-moz-linear-gradient("+a+");background:-webkit-linear-gradient("+a+");background:-o-linear-gradient("+a+");background:-ms-linear-gradient("+a+");background:linear-gradient("+a+");"}var c,a="."+e.id;"editor"==d?c=a+" .cke_inner,"+a+" .cke_dialog_tab{background-color:$color;background:-webkit-gradient(linear,0 -15,0 40,from(#fff),to($color));"+b("top,#fff -15px,$color 40px")+"}"+a+" .cke_toolgroup{background:-webkit-gradient(linear,0 0,0 100,from(#fff),to($color));"+
b("top,#fff,$color 100px")+"}"+a+" .cke_combo_button{background:-webkit-gradient(linear, left bottom, left -100, from(#fff), to($color));"+b("bottom,#fff,$color 100px")+"}"+a+" .cke_dialog_contents,"+a+" .cke_dialog_footer{background-color:$color !important;}"+a+" .cke_dialog_tab:hover,"+a+" .cke_dialog_tab:active,"+a+" .cke_dialog_tab:focus,"+a+" .cke_dialog_tab_selected{background-color:$color;background-image:none;}":"panel"==d&&(c=".cke_menubutton_icon{background-color:$color !important;border-color:$color !important;}.cke_menubutton:hover .cke_menubutton_icon,.cke_menubutton:focus .cke_menubutton_icon,.cke_menubutton:active .cke_menubutton_icon{background-color:$color !important;border-color:$color !important;}.cke_menubutton:hover .cke_menubutton_label,.cke_menubutton:focus .cke_menubutton_label,.cke_menubutton:active .cke_menubutton_label{background-color:$color !important;}.cke_menubutton_disabled:hover .cke_menubutton_label,.cke_menubutton_disabled:focus .cke_menubutton_label,.cke_menubutton_disabled:active .cke_menubutton_label{background-color: transparent !important;}.cke_menubutton_disabled:hover .cke_menubutton_icon,.cke_menubutton_disabled:focus .cke_menubutton_icon,.cke_menubutton_disabled:active .cke_menubutton_icon{background-color:$color !important;border-color:$color !important;}.cke_menubutton_disabled .cke_menubutton_icon{background-color:$color !important;border-color:$color !important;}.cke_menuseparator{background-color:$color !important;}.cke_menubutton:hover,.cke_menubutton:focus,.cke_menubutton:active{background-color:$color !important;}");
return c};
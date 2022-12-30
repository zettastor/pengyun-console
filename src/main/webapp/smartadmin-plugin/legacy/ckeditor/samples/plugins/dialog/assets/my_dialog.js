/*
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

CKEDITOR.dialog.add( 'myDialog', function() {
	return {
		title: 'My Dialog',
		minWidth: 400,
		minHeight: 200,
		contents: [
			{
				id: 'tab1',
				label: 'First Tab',
				title: 'First Tab',
				elements: [
					{
						id: 'input1',
						type: 'text',
						label: 'Text Field'
					},
					{
						id: 'select1',
						type: 'select',
						label: 'Select Field',
						items: [
							[ 'option1', 'value1' ],
							[ 'option2', 'value2' ]
						]
					}
				]
			},
			{
				id: 'tab2',
				label: 'Second Tab',
				title: 'Second Tab',
				elements: [
					{
						id: 'button1',
						type: 'button',
						label: 'Button Field'
					}
				]
			}
		]
	};
} );


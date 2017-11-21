// 异步获取树型数据
async function (treeNode){
	if(treeNode.props.children) {
		return;
	}
	const url = '/api/tree';
	let params = {pid: treeNode.props.dataRef.treeId};
	const options = {
    	method: 'POST',
	    body: JSON.stringify(params),
	    data:params,
  	};
	const response = await fetch(url, options);
	const data = await response.json();

	if(data) {
		if(data&&data.length>0) {
			treeNode.props.dataRef.children = data;
		}
		onTreeChange(treeList);
	}
}
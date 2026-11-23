/* Shared low-allocation mesh kit for walkable Academy rooms.
 * Pass the existing Three.js exports and a scene; geometry is reused per room. */
export function createRoyalRoomKit(THREE, scene) {
  const geometry = Object.freeze({
    box: new THREE.BoxGeometry(1, 1, 1),
    cylinder: new THREE.CylinderGeometry(.42, .52, 1, 12),
    sphere: new THREE.SphereGeometry(1, 16, 12)
  });
  function mesh(kind, {name = '', position = [0, 0, 0], scale = [1, 1, 1], material, parent = scene}) {
    const object = new THREE.Mesh(geometry[kind], material);
    object.name = name;
    object.position.set(...position);
    object.scale.set(...scale);
    parent.add(object);
    return object;
  }
  return Object.freeze({
    box({name, position, size, material}) {
      return mesh('box', {name, position, scale: size, material});
    },
    cylinder({name, position, height, radius = .34, material}) {
      return mesh('cylinder', {name, position, scale: [radius / .47, height, radius / .47], material});
    },
    sphere({name, position, size = [1, 1, 1], material, parent}) {
      return mesh('sphere', {name, position, scale: size, material, parent: parent || scene});
    },
    geometry
  });
}
